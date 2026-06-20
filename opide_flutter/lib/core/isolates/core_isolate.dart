import 'dart:isolate';
import 'dart:io';

/// Ponto de entrada (Entrypoint) do Isolate de Background (CoreIsolate)
void coreFileIsolateEntry(SendPort mainSendPort) {
  final receivePort = ReceivePort();
  
  // Envia a SendPort do CoreIsolate de volta para a UI (Handshake)
  mainSendPort.send(receivePort.sendPort);

  receivePort.listen((message) async {
    if (message is Map<String, dynamic>) {
      final String? id = message['id'];
      final String? action = message['action'];
      final dynamic data = message['data'];

      if (id == null) return;

      try {
        switch (action) {
          case 'ping':
            mainSendPort.send({
              'id': id,
              'type': 'response',
              'data': 'pong',
            });
            break;

          case 'readFile':
            final path = data as String;
            final file = File(path);
            if (await file.exists()) {
              final content = await file.readAsString();
              mainSendPort.send({
                'id': id,
                'type': 'response',
                'data': content,
              });
            } else {
              mainSendPort.send({
                'id': id,
                'type': 'error',
                'data': 'Arquivo não encontrado: $path',
              });
            }
            break;

          default:
            mainSendPort.send({
              'id': id,
              'type': 'error',
              'data': 'Ação desconhecida: $action',
            });
        }
      } catch (e) {
        mainSendPort.send({
          'id': id,
          'type': 'error',
          'data': e.toString(),
        });
      }
    }
  });
}
