import 'dart:async';
import 'dart:isolate';
import 'core_isolate.dart';

/// Gerenciador de Isolates para orquestração multi-processo do OPIDE.
class IsolateManager {
  static final IsolateManager _instance = IsolateManager._internal();
  factory IsolateManager() => _instance;
  IsolateManager._internal();

  Isolate? _coreIsolate;
  SendPort? _coreSendPort;
  final ReceivePort _mainReceivePort = ReceivePort();

  final Map<String, Completer<dynamic>> _pendingRequests = {};
  int _requestIdCounter = 0;

  bool _initialized = false;
  bool get isInitialized => _initialized;

  /// Inicializa o Core Isolate e estabelece o handshake inicial
  Future<void> initialize() async {
    if (_initialized) return;

    print('[IsolateManager] Inicializando barramento de Isolates...');

    // Escuta mensagens vindas dos Isolates secundários
    _mainReceivePort.listen(_handleIncomingMessage);

    // Spawna o Core Isolate passando a SendPort do Isolate Principal
    _coreIsolate = await Isolate.spawn(
      coreFileIsolateEntry,
      _mainReceivePort.sendPort,
      debugName: 'OPIDE_CoreIsolate',
    );

    _initialized = true;
  }

  /// Trata mensagens recebidas dos Isolates no Isolate Principal (UI)
  void _handleIncomingMessage(dynamic message) {
    if (message is SendPort) {
      // Handshake: o Core Isolate enviou sua SendPort
      _coreSendPort = message;
      print('[IsolateManager] Handshake com CoreIsolate concluído com sucesso.');
    } else if (message is Map<String, dynamic>) {
      final String? id = message['id'];
      final String? type = message['type'];
      final dynamic data = message['data'];

      if (id != null && _pendingRequests.containsKey(id)) {
        final completer = _pendingRequests.remove(id);
        if (type == 'error') {
          completer?.completeError(data ?? 'Erro desconhecido no Isolate');
        } else {
          completer?.complete(data);
        }
      } else {
        // Mensagens não solicitadas (ex: eventos de alteração de arquivo)
        print('[IsolateManager] Mensagem broadcast recebida: $message');
      }
    }
  }

  /// Envia uma requisição ao Core Isolate e aguarda a resposta assíncrona
  Future<T> sendRequest<T>(String action, dynamic data) {
    if (_coreSendPort == null) {
      return Future.error('CoreIsolate não inicializado ou handshake pendente.');
    }

    final id = 'req_${_requestIdCounter++}';
    final completer = Completer<T>();
    _pendingRequests[id] = completer;

    _coreSendPort!.send({
      'id': id,
      'action': action,
      'data': data,
    });

    return completer.future;
  }

  /// Finaliza os Isolates ativos
  void dispose() {
    _coreIsolate?.kill(priority: Isolate.beforeNextEvent);
    _mainReceivePort.close();
    _initialized = false;
    print('[IsolateManager] Isolates finalizados.');
  }
}
