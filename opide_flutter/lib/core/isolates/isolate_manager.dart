import 'dart:async';
import 'dart:isolate';
import 'core_isolate.dart';
import '../agent/ai_agent_isolate.dart';

/// Gerenciador de Isolates para orquestração multi-processo do OPIDE.
class IsolateManager {
  static final IsolateManager _instance = IsolateManager._internal();
  factory IsolateManager() => _instance;
  IsolateManager._internal();

  Isolate? _coreIsolate;
  SendPort? _coreSendPort;

  Isolate? _aiIsolate;
  SendPort? _aiSendPort;

  final ReceivePort _mainReceivePort = ReceivePort();

  final Map<String, Completer<dynamic>> _pendingRequests = {};
  final StreamController<Map<String, dynamic>> _aiEventController = 
      StreamController<Map<String, dynamic>>.broadcast();

  int _requestIdCounter = 0;

  bool _initialized = false;
  bool get isInitialized => _initialized;

  /// Stream de eventos/tokens disparados pelo AI Isolate em tempo real
  Stream<Map<String, dynamic>> get aiEventStream => _aiEventController.stream;

  /// Inicializa os Isolates (Core e AI) e estabelece os handshakes iniciais
  Future<void> initialize() async {
    if (_initialized) return;

    print('[IsolateManager] Inicializando barramento de Isolates...');

    // Escuta mensagens vindas de todos os Isolates
    _mainReceivePort.listen(_handleIncomingMessage);

    // Spawna o Core Isolate
    _coreIsolate = await Isolate.spawn(
      coreFileIsolateEntry,
      _mainReceivePort.sendPort,
      debugName: 'OPIDE_CoreIsolate',
    );

    // Spawna o AI Agent Isolate
    _aiIsolate = await Isolate.spawn(
      aiAgentIsolateEntry,
      _mainReceivePort.sendPort,
      debugName: 'OPIDE_AiIsolate',
    );

    _initialized = true;
  }

  /// Trata mensagens recebidas dos Isolates no Isolate Principal (UI)
  void _handleIncomingMessage(dynamic message) {
    if (message is Map<String, dynamic>) {
      final String? msgType = message['type'];
      
      // Verifica se é uma resposta de handshake
      if (message['type'] == 'handshake') {
        final SendPort port = message['port'] as SendPort;
        final String name = message['name'] as String;
        
        if (name == 'core') {
          _coreSendPort = port;
          print('[IsolateManager] Handshake com CoreIsolate concluído.');
        } else if (name == 'ai') {
          _aiSendPort = port;
          print('[IsolateManager] Handshake com AIAgentIsolate concluído.');
        }
        return;
      }

      // Eventos de streaming (como tokens de IA)
      if (msgType == 'event') {
        _aiEventController.add(message['data'] as Map<String, dynamic>);
        return;
      }

      // Requisições normais (Futuros) baseadas em ID
      final String? id = message['id'];
      final dynamic data = message['data'];

      if (id != null && _pendingRequests.containsKey(id)) {
        final completer = _pendingRequests.remove(id);
        if (msgType == 'error') {
          completer?.completeError(data ?? 'Erro desconhecido no Isolate');
        } else {
          completer?.complete(data);
        }
      }
    }
  }

  /// Envia uma requisição ao Core Isolate (Operações de arquivo/LSP)
  Future<T> sendRequest<T>(String action, dynamic data) {
    if (_coreSendPort == null) {
      return Future.error('CoreIsolate não inicializado ou handshake pendente.');
    }

    final id = 'core_req_${_requestIdCounter++}';
    final completer = Completer<T>();
    _pendingRequests[id] = completer;

    _coreSendPort!.send({
      'id': id,
      'action': action,
      'data': data,
    });

    return completer.future;
  }

  /// Envia uma requisição ao AI Agent Isolate (Geração/Prompt)
  Future<T> sendAiRequest<T>(String action, dynamic data) {
    if (_aiSendPort == null) {
      return Future.error('AIAgentIsolate não inicializado ou handshake pendente.');
    }

    final id = 'ai_req_${_requestIdCounter++}';
    final completer = Completer<T>();
    _pendingRequests[id] = completer;

    _aiSendPort!.send({
      'id': id,
      'action': action,
      'data': data,
    });

    return completer.future;
  }

  /// Finaliza todos os Isolates ativos
  void dispose() {
    _coreIsolate?.kill(priority: Isolate.beforeNextEvent);
    _aiIsolate?.kill(priority: Isolate.beforeNextEvent);
    _mainReceivePort.close();
    _aiEventController.close();
    _initialized = false;
    print('[IsolateManager] Todos os Isolates foram finalizados.');
  }
}
