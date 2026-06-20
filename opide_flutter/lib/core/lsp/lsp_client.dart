import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'package:json_rpc_2/json_rpc_2.dart' as json_rpc;
import 'package:stream_channel/stream_channel.dart';

/// Cliente LSP (Language Server Protocol) para o OPIDE.
/// Gerencia o ciclo de vida do processo do servidor e a comunicação JSON-RPC.
class LspClient {
  final String serverPath;
  final List<String> serverArgs;
  
  Process? _process;
  json_rpc.Peer? _peer;
  final StreamController<Map<String, dynamic>> _diagnosticsController = 
      StreamController<Map<String, dynamic>>.broadcast();

  LspClient({required this.serverPath, this.serverArgs = const []});

  /// Stream para escutar diagnósticos de código emitidos pelo servidor.
  Stream<Map<String, dynamic>> get diagnosticsStream => _diagnosticsController.stream;

  /// Inicia o servidor e estabelece a conexão RPC.
  Future<void> start() async {
    print('[LSP] Iniciando servidor em: $serverPath...');
    
    _process = await Process.start(serverPath, serverArgs);

    // Configura o parser de mensagens delimitadas por quebra de linha
    final stdoutStream = _process!.stdout
        .transform(utf8.decoder)
        .transform(const LineSplitter());

    final channel = StreamChannel<String>(
      stdoutStream,
      StringSinkWrapper(_process!.stdin),
    );

    _peer = json_rpc.Peer(channel);

    // Registra manipuladores para notificações vindas do servidor
    _peer!.registerMethod('textDocument/publishDiagnostics', (json_rpc.Parameters params) {
      _diagnosticsController.add(params.asMap as Map<String, dynamic>);
    });

    // Inicia a escuta de mensagens do Peer de forma assíncrona
    unawaited(_peer!.listen());

    // Envia a requisição de inicialização (Initialize Request)
    await _peer!.sendRequest('initialize', {
      'processId': pid,
      'rootUri': 'file:///workspace',
      'capabilities': {
        'textDocument': {
          'synchronization': {
            'didSave': true,
            'dynamicRegistration': true,
          },
          'completion': {
            'completionItem': {
              'snippetSupport': true,
            }
          }
        }
      },
    });

    // Notifica o servidor que a inicialização foi concluída
    _peer!.sendNotification('initialized', {});
    print('[LSP] Servidor inicializado com sucesso.');
  }

  /// Notifica o servidor que um arquivo foi aberto.
  void didOpen(String uri, String languageId, String text) {
    _peer?.sendNotification('textDocument/didOpen', {
      'textDocument': {
        'uri': uri,
        'languageId': languageId,
        'version': 1,
        'text': text,
      }
    });
  }

  /// Notifica o servidor sobre mudanças no arquivo.
  void didChange(String uri, String text, int version) {
    _peer?.sendNotification('textDocument/didChange', {
      'textDocument': {
        'uri': uri,
        'version': version,
      },
      'contentChanges': [
        {'text': text}
      ]
    });
  }

  /// Desliga o servidor LSP de forma limpa.
  Future<void> stop() async {
    if (_peer != null && !_peer!.isClosed) {
      await _peer!.sendRequest('shutdown');
      _peer!.sendNotification('exit');
    }
    _process?.kill();
    await _diagnosticsController.close();
    print('[LSP] Servidor finalizado.');
  }
}

/// Wrapper simples para converter chamadas de escrita de String em binário (UTF-8) para o IOSink (stdin do processo).
class StringSinkWrapper implements StreamSink<String> {
  final IOSink _sink;
  StringSinkWrapper(this._sink);

  @override
  void add(String event) {
    _sink.write(event);
  }

  @override
  void addError(Object error, [StackTrace? stackTrace]) {
    _sink.addError(error, stackTrace);
  }

  @override
  Future addStream(Stream<String> stream) {
    return _sink.addStream(stream.map((s) => utf8.encode(s)));
  }

  @override
  Future get done => _sink.done;

  @override
  Future close() => _sink.close();
}
