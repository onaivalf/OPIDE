// Template Rust - Iniciante
// Este é um arquivo de exemplo para o modo educacional

/// Função que retorna uma saudação personalizada
/// 
/// # Arguments
/// * `nome` - O nome da pessoa a ser saudada
/// 
/// # Returns
/// Uma mensagem de saudação como String
fn saudacao(nome: &str) -> String {
    format!("Olá, {}! Bem-vindo ao OPIDE!", nome)
}

fn main() {
    // TODO: Chame a função saudacao com seu nome abaixo
    // Exemplo: println!("{}", saudacao("Seu Nome"));
    
    // Execute este arquivo para ver o resultado
    println!("{}", saudacao("Estudante"));
    
    // Exercício extra: Crie uma nova função que some dois números
    // fn somar(a: i32, b: i32) -> i32 { ... }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_saudacao() {
        assert_eq!(saudacao("Maria"), "Olá, Maria! Bem-vindo ao OPIDE!");
    }
}
