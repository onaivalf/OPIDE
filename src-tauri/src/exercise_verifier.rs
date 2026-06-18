use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use std::process::Command;

/// Resultado da verificação de um exercício
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseResult {
    pub exercise_id: String,
    pub passed: bool,
    pub score: f64,
    pub feedback: String,
    pub tests_passed: usize,
    pub tests_total: usize,
    pub execution_time_ms: u64,
    pub error_message: Option<String>,
}

/// Definição de um exercício
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExerciseDefinition {
    pub id: String,
    pub title: String,
    pub description: String,
    pub language: String,
    pub starter_code: String,
    pub tests: Vec<TestConfig>,
    pub hints: Vec<String>,
    pub max_score: f64,
    pub time_limit_ms: u64,
}

/// Configuração de um teste
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TestConfig {
    pub name: String,
    pub input: Option<String>,
    pub expected_output: Option<String>,
    pub test_type: TestType,
    pub weight: f64,
}

/// Tipos de teste suportados
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TestType {
    Io,           // Entrada/Saída
    Unit,         // Teste unitário
    Integration,  // Teste de integração
    Performance,  // Teste de performance
    Static,       // Análise estática de código
}

/// Sistema de verificação de exercícios
pub struct ExerciseVerifier {
    exercises: HashMap<String, ExerciseDefinition>,
}

impl ExerciseVerifier {
    pub fn new() -> Self {
        Self {
            exercises: HashMap::new(),
        }
    }

    /// Carrega exercícios de um diretório
    pub fn load_exercises(&mut self, directory: &str) -> Result<(), String> {
        let path = Path::new(directory);
        
        if !path.exists() {
            return Err(format!("Diretório de exercícios não encontrado: {}", directory));
        }

        for entry in fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let file_path = entry.path();
            
            if file_path.extension().and_then(|s| s.to_str()) == Some("json") {
                let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
                let exercise: ExerciseDefinition = 
                    serde_json::from_str(&content).map_err(|e| e.to_string())?;
                
                self.exercises.insert(exercise.id.clone(), exercise);
            }
        }

        Ok(())
    }

    /// Verifica a solução de um exercício
    pub fn verify_solution(
        &self,
        exercise_id: &str,
        user_code: &str,
    ) -> ExerciseResult {
        let start_time = std::time::Instant::now();

        let exercise = match self.exercises.get(exercise_id) {
            Some(ex) => ex,
            None => {
                return ExerciseResult {
                    exercise_id: exercise_id.to_string(),
                    passed: false,
                    score: 0.0,
                    feedback: "Exercício não encontrado.".to_string(),
                    tests_passed: 0,
                    tests_total: 0,
                    execution_time_ms: 0,
                    error_message: Some("Exercício não encontrado".to_string()),
                };
            }
        };

        let mut tests_passed = 0;
        let mut total_weight = 0.0;
        let mut earned_weight = 0.0;
        let mut errors = Vec::new();

        for test in &exercise.tests {
            total_weight += test.weight;
            
            let test_result = self.run_test(exercise, user_code, test);
            
            if test_result.passed {
                tests_passed += 1;
                earned_weight += test.weight;
            } else {
                if let Some(err) = test_result.error {
                    errors.push(format!("Teste '{}': {}", test.name, err));
                }
            }
        }

        let execution_time = start_time.elapsed().as_millis() as u64;
        let score = if total_weight > 0.0 {
            (earned_weight / total_weight) * exercise.max_score
        } else {
            0.0
        };

        let passed = tests_passed == exercise.tests.len();
        let feedback = self.generate_feedback(passed, tests_passed, exercise.tests.len(), &errors, &exercise.hints);

        ExerciseResult {
            exercise_id: exercise_id.to_string(),
            passed,
            score,
            feedback,
            tests_passed,
            tests_total: exercise.tests.len(),
            execution_time_ms: execution_time,
            error_message: if errors.is_empty() { None } else { Some(errors.join("\n")) },
        }
    }

    /// Executa um teste individual
    fn run_test(
        &self,
        exercise: &ExerciseDefinition,
        user_code: &str,
        test: &TestConfig,
    ) -> SingleTestResult {
        match test.test_type {
            TestType::Io => self.run_io_test(exercise, user_code, test),
            TestType::Unit => self.run_unit_test(exercise, user_code, test),
            TestType::Static => self.run_static_analysis(exercise, user_code, test),
            _ => SingleTestResult {
                passed: false,
                error: Some("Tipo de teste não implementado".to_string()),
            },
        }
    }

    /// Executa teste de entrada/saída
    fn run_io_test(
        &self,
        exercise: &ExerciseDefinition,
        user_code: &str,
        test: &TestConfig,
    ) -> SingleTestResult {
        // Cria um arquivo temporário com o código do usuário
        let temp_dir = tempfile::tempdir().map_err(|e| e.to_string()).unwrap();
        let code_file = temp_dir.path().join(match exercise.language.as_str() {
            "python" => "solution.py",
            "javascript" | "typescript" => "solution.js",
            "rust" => "solution.rs",
            _ => "solution.txt",
        });

        fs::write(&code_file, user_code).map_err(|e| e.to_string()).unwrap();

        // Executa o código baseado na linguagem
        let output = match exercise.language.as_str() {
            "python" => Command::new("python3")
                .arg(&code_file)
                .input(test.input.as_deref().unwrap_or(""))
                .output(),
            "javascript" | "typescript" => Command::new("node")
                .arg(&code_file)
                .input(test.input.as_deref().unwrap_or(""))
                .output(),
            "rust" => {
                // Para Rust, precisamos compilar primeiro
                let bin_file = temp_dir.path().join("solution");
                let compile_result = Command::new("rustc")
                    .arg(&code_file)
                    .arg("-o")
                    .arg(&bin_file)
                    .output();

                match compile_result {
                    Ok(out) if out.status.success() => {
                        Command::new(&bin_file)
                            .input(test.input.as_deref().unwrap_or(""))
                            .output()
                    }
                    Ok(out) => return SingleTestResult {
                        passed: false,
                        error: Some(String::from_utf8_lossy(&out.stderr).to_string()),
                    },
                    Err(e) => return SingleTestResult {
                        passed: false,
                        error: Some(e.to_string()),
                    },
                }
            }
            _ => return SingleTestResult {
                passed: false,
                error: Some(format!("Linguagem '{}' não suportada", exercise.language)),
            },
        };

        match output {
            Ok(out) => {
                let stdout = String::from_utf8_lossy(&out.stdout).trim().to_string();
                let expected = test.expected_output.as_deref().unwrap_or("").trim();
                
                if stdout == expected && out.status.success() {
                    SingleTestResult { passed: true, error: None }
                } else {
                    let error_msg = if !out.status.success() {
                        format!("Erro de execução: {}", String::from_utf8_lossy(&out.stderr))
                    } else {
                        format!("Saída esperada: '{}', obtida: '{}'", expected, stdout)
                    };
                    SingleTestResult { passed: false, error: Some(error_msg) }
                }
            }
            Err(e) => SingleTestResult {
                passed: false,
                error: Some(format!("Falha ao executar: {}", e)),
            },
        }
    }

    /// Executa teste unitário (implementação simplificada)
    fn run_unit_test(
        &self,
        exercise: &ExerciseDefinition,
        user_code: &str,
        test: &TestConfig,
    ) -> SingleTestResult {
        // Implementação específica por linguagem seria necessária aqui
        // Por enquanto, retorna um resultado placeholder
        SingleTestResult {
            passed: false,
            error: Some("Testes unitários ainda não implementados para esta linguagem".to_string()),
        }
    }

    /// Executa análise estática de código
    fn run_static_analysis(
        &self,
        exercise: &ExerciseDefinition,
        user_code: &str,
        test: &TestConfig,
    ) -> SingleTestResult {
        // Verificações básicas de estilo e estrutura
        let mut issues = Vec::new();

        // Exemplo: verificar se o código não está vazio
        if user_code.trim().is_empty() {
            issues.push("Código vazio".to_string());
        }

        // Exemplo: verificar presença de comentários em Python
        if exercise.language == "python" && !user_code.contains('#') {
            issues.push("Código Python deve conter comentários explicativos".to_string());
        }

        if issues.is_empty() {
            SingleTestResult { passed: true, error: None }
        } else {
            SingleTestResult {
                passed: false,
                error: Some(issues.join("; ")),
            }
        }
    }

    /// Gera feedback para o aluno
    fn generate_feedback(
        &self,
        passed: bool,
        tests_passed: usize,
        tests_total: usize,
        errors: &[String],
        hints: &[String],
    ) -> String {
        if passed {
            return "🎉 Parabéns! Todos os testes passaram com sucesso!".to_string();
        }

        let mut feedback = format!(
            "Você passou em {} de {} testes.\n\n",
            tests_passed, tests_total
        );

        if !errors.is_empty() {
            feedback.push_str("Erros encontrados:\n");
            for (i, error) in errors.iter().take(3).enumerate() {
                feedback.push_str(&format!("{}. {}\n", i + 1, error));
            }
            if errors.len() > 3 {
                feedback.push_str(&format!("... e mais {} erros.\n", errors.len() - 3));
            }
            feedback.push('\n');
        }

        if !hints.is_empty() && tests_passed < tests_total {
            feedback.push_str("💡 Dicas:\n");
            let hint_index = std::cmp::min(tests_passed, hints.len() - 1);
            feedback.push_str(&format!("- {}\n", hints[hint_index]));
        }

        feedback
    }

    /// Obtém informações sobre um exercício
    pub fn get_exercise(&self, exercise_id: &str) -> Option<&ExerciseDefinition> {
        self.exercises.get(exercise_id)
    }

    /// Lista todos os exercícios disponíveis
    pub fn list_exercises(&self) -> Vec<&ExerciseDefinition> {
        self.exercises.values().collect()
    }
}

struct SingleTestResult {
    passed: bool,
    error: Option<String>,
}

// Trait para estender Command com método input
trait CommandExt {
    fn input(&mut self, input: &str) -> &mut Self;
}

impl CommandExt for Command {
    fn input(&mut self, input: &str) -> &mut Self {
        use std::io::Write;
        self.stdin(std::process::Stdio::piped());
        self.stdout(std::process::Stdio::piped());
        self.stderr(std::process::Stdio::piped());
        
        let mut child = self.spawn().expect("Failed to spawn command");
        {
            let stdin = child.stdin.as_mut().expect("Failed to open stdin");
            stdin.write_all(input.as_bytes()).expect("Failed to write to stdin");
        }
        
        // Substituímos self pelo child, mas isso não é possível diretamente
        // Esta é uma implementação simplificada - na prática precisaríamos de uma abordagem diferente
        self // Placeholder
    }
}

// Exportação para uso no frontend via Tauri
#[tauri::command]
pub fn verify_exercise(exercise_id: String, user_code: String) -> Result<ExerciseResult, String> {
    let mut verifier = ExerciseVerifier::new();
    
    // Em produção, carregaria de um diretório configurado
    // Aqui usamos exercícios embutidos ou mock
    verifier.load_exercises("./exercises").unwrap_or(());
    
    Ok(verifier.verify_solution(&exercise_id, &user_code))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_verifier_creation() {
        let verifier = ExerciseVerifier::new();
        assert_eq!(verifier.list_exercises().len(), 0);
    }

    #[test]
    fn test_nonexistent_exercise() {
        let verifier = ExerciseVerifier::new();
        let result = verifier.verify_solution("nonexistent", "print('hello')");
        assert!(!result.passed);
        assert_eq!(result.score, 0.0);
    }
}
