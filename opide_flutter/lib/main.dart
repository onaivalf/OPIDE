import 'dart:async';
import 'package:flutter/material.dart';
import 'core/isolates/isolate_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Inicializa o gerenciador de Isolates
  final isolateManager = IsolateManager();
  await isolateManager.initialize();

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OPIDE Flutter Core',
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFFE8B931),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const MyHomePage(title: 'OPIDE Flutter Core - Teste de Isolates'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String _isolateStatus = 'Aguardando teste...';
  bool _testing = false;
  StreamSubscription? _aiSubscription;

  @override
  void initState() {
    super.initState();
    // Escuta eventos vindos do AI Isolate em tempo real
    _aiSubscription = IsolateManager().aiEventStream.listen((event) {
      if (event['type'] == 'token') {
        setState(() {
          _isolateStatus += event['token'] as String;
        });
      }
    });
  }

  Future<void> _runPingTest() async {
    setState(() {
      _testing = true;
      _isolateStatus = 'Enviando Ping para o Core Isolate...';
    });

    try {
      final response = await IsolateManager().sendRequest<String>('ping', null);
      setState(() {
        _isolateStatus = 'Resposta do Isolate: $response (Sucesso!)';
      });
    } catch (e) {
      setState(() {
        _isolateStatus = 'Erro ao se comunicar: $e';
      });
    } finally {
      setState(() {
        _testing = false;
      });
    }
  }

  Future<void> _runAiStreamTest() async {
    setState(() {
      _testing = true;
      _isolateStatus = 'AI Streaming: ';
    });

    try {
      await IsolateManager().sendAiRequest('generate', 'Esta é uma stream de tokens vinda do isolate de IA em tempo real.');
    } catch (e) {
      setState(() {
        _isolateStatus = 'Erro na IA: $e';
      });
    } finally {
      setState(() {
        _testing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.primaryContainer,
        title: Text(widget.title),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.memory,
                size: 72,
                color: Color(0xFFE8B931),
              ),
              const SizedBox(height: 24),
              const Text(
                'Status do Barramento de Isolates:',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Text(
                _isolateStatus,
                style: TextStyle(
                  fontSize: 16,
                  color: _isolateStatus.contains('Sucesso') ? Colors.green : Colors.grey,
                  fontFamily: 'monospace',
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: [
                  ElevatedButton.icon(
                    onPressed: _testing ? null : _runPingTest,
                    icon: const Icon(Icons.send),
                    label: const Text('Enviar Ping (Core Isolate)'),
                  ),
                  ElevatedButton.icon(
                    onPressed: _testing ? null : _runAiStreamTest,
                    icon: const Icon(Icons.psychology),
                    label: const Text('Stream Tokens (AI Isolate)'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _aiSubscription?.cancel();
    super.dispose();
  }
}
