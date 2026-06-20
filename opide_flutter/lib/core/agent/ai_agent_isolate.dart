import 'dart:isolate';
import 'dart:async';

/// Representação de eventos de resposta do AI Agent.
abstract class AgentEvent {
  final String taskId;
  AgentEvent(this.taskId);

  Map<String, dynamic> toJson();
}

class AgentTokenReceived extends AgentEvent {
  final String token;
  AgentTokenReceived(String taskId, this.token) : super(taskId);

  @override
  Map<String, dynamic> toJson() => {
        'taskId': taskId,
        'type': 'token',
        'token': token,
      };
}

class AgentTaskCompleted extends AgentEvent {
  final Map<String, dynamic> result;
  AgentTaskCompleted(String taskId, this.result) : super(taskId);

  @override
  Map<String, dynamic> toJson() => {
        'taskId': taskId,
        'type': 'completed',
        'result': result,
      };
}

class AgentTaskFailed extends AgentEvent {
  final String error;
  AgentTaskFailed(String taskId, this.error) : super(taskId);

  @override
  Map<String, dynamic> toJson() => {
        'taskId': taskId,
        'type': 'failed',
        'error': error,
      };
}

/// Entrypoint do Isolate de Inteligência Artificial do OPIDE (AI Agent Isolate).
void aiAgentIsolateEntry(SendPort mainSendPort) {
  final receivePort = ReceivePort();
  
  // Envia a SendPort do AI Agent de volta para a UI (Handshake)
  mainSendPort.send({
    'type': 'handshake',
    'port': receivePort.sendPort,
    'name': 'ai',
  });

  receivePort.listen((message) async {
    if (message is Map<String, dynamic>) {
      final String? id = message['id'];
      final String? action = message['action'];
      final dynamic data = message['data'];

      if (id == null) return;

      try {
        switch (action) {
          case 'generate':
            final prompt = data as String;
            
            // Simula a geração de resposta via streaming de tokens
            final words = prompt.split(' ');
            for (final word in words) {
              await Future.delayed(const Duration(milliseconds: 100));
              mainSendPort.send({
                'id': id,
                'type': 'event',
                'data': AgentTokenReceived(id, '$word ').toJson(),
              });
            }

            mainSendPort.send({
              'id': id,
              'type': 'response',
              'data': AgentTaskCompleted(id, {'status': 'success'}).toJson(),
            });
            break;

          default:
            mainSendPort.send({
              'id': id,
              'type': 'error',
              'data': 'Ação de IA desconhecida: $action',
            });
        }
      } catch (e) {
        mainSendPort.send({
          'id': id,
          'type': 'error',
          'data': AgentTaskFailed(id, e.toString()).toJson(),
        });
      }
    }
  });
}
