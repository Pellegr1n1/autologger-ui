import { Card, Typography, Divider, Space } from 'antd';
import styles from './PrivacyPage.module.css';

const { Title, Paragraph, Text } = Typography;

export default function PrivacyPage() {
  return (
    <div className={styles.privacyContainer}>
      <div className={styles.privacyContent}>
        <Card className={styles.privacyCard}>
          <div className={styles.privacyHeader}>
            <Title level={2} className={styles.privacyTitle}>
              Política de Privacidade
            </Title>
            <Text className={styles.privacySubtitle}>AutoLogger - Sistema de Gestão Veicular</Text>
            <div className={styles.lastUpdate}>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div className={styles.contentArea}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={3} className={styles.sectionTitle}>1. Introdução</Title>
                <Paragraph className={styles.sectionContent}>
                  Esta Política de Privacidade descreve como o AutoLogger coleta, usa, armazena 
                  e protege suas informações pessoais em conformidade com a Lei Geral de Proteção 
                  de Dados (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  Ao utilizar o AutoLogger, você concorda com as práticas descritas nesta política.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>2. Dados Coletados</Title>
                
                <Title level={4} className={styles.sectionSubtitle}>2.1 Dados Pessoais</Title>
                <Paragraph className={styles.sectionContent}>
                  Coletamos as seguintes informações pessoais quando você se cadastra e utiliza o AutoLogger:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Dados de Identificação:</strong> Nome completo, endereço de e-mail</li>
                  <li><strong>Dados de Autenticação:</strong> Senha criptografada (quando não utiliza login social)</li>
                  <li><strong>Dados de Perfil:</strong> Avatar (opcional), provedor de autenticação (local ou Google)</li>
                  <li><strong>Dados de Sessão:</strong> Tokens JWT para manutenção da sessão de login</li>
                </ul>

                <Title level={4} className={styles.sectionSubtitle}>2.2 Dados Veiculares</Title>
                <Paragraph className={styles.sectionContent}>
                  Para fornecer nossos serviços, coletamos informações sobre seus veículos:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Identificação do Veículo:</strong> Placa, marca, modelo, ano, cor, RENAVAM</li>
                  <li><strong>Dados de Uso:</strong> Quilometragem atual e histórico de quilometragem</li>
                  <li><strong>Documentação:</strong> Fotos do veículo (opcional)</li>
                  <li><strong>Status:</strong> Se o veículo está ativo ou foi vendido</li>
                </ul>

                <Title level={4} className={styles.sectionSubtitle}>2.3 Dados de Serviços Veiculares</Title>
                <Paragraph className={styles.sectionContent}>
                  Registramos informações sobre serviços e despesas realizados:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Detalhes do Serviço:</strong> Tipo, categoria, descrição, data, custo</li>
                  <li><strong>Localização:</strong> Local onde o serviço foi realizado</li>
                  <li><strong>Profissional:</strong> Nome do técnico responsável (opcional)</li>
                  <li><strong>Documentação:</strong> Anexos como notas fiscais, fotos (PDF, JPG, PNG)</li>
                  <li><strong>Observações:</strong> Notas adicionais sobre o serviço</li>
                </ul>

                <Title level={4} className={styles.sectionSubtitle}>2.4 Dados de Uso da Plataforma</Title>
                <Paragraph className={styles.sectionContent}>
                  Coletamos automaticamente algumas informações sobre como você usa o AutoLogger:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Logs de Acesso:</strong> Data e hora de login, páginas visitadas</li>
                  <li><strong>Dados Técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
                  <li><strong>Cookies:</strong> Para melhorar a experiência de uso e manter a sessão</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>3. Finalidades do Tratamento</Title>
                <Paragraph className={styles.sectionContent}>
                  Utilizamos seus dados pessoais para as seguintes finalidades:
                </Paragraph>
                
                <Title level={4} className={styles.sectionSubtitle}>3.1 Prestação do Serviço</Title>
                <ul className={styles.sectionList}>
                  <li>Permitir o cadastro e autenticação na plataforma</li>
                  <li>Gerenciar seus veículos e serviços registrados</li>
                  <li>Registrar eventos na blockchain para garantir imutabilidade</li>
                  <li>Gerar relatórios e análises de gastos</li>
                  <li>Facilitar o compartilhamento de histórico via QR Code</li>
                </ul>

                <Title level={4} className={styles.sectionSubtitle}>3.2 Melhoria do Serviço</Title>
                <ul className={styles.sectionList}>
                  <li>Analisar o uso da plataforma para melhorias</li>
                  <li>Desenvolver novas funcionalidades</li>
                  <li>Otimizar a performance e segurança</li>
                </ul>

                <Title level={4} className={styles.sectionSubtitle}>3.3 Conformidade Legal</Title>
                <ul className={styles.sectionList}>
                  <li>Cumprir obrigações legais aplicáveis</li>
                  <li>Responder a solicitações de autoridades competentes</li>
                  <li>Proteger direitos e interesses legítimos</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>4. Base Legal para o Tratamento</Title>
                <Paragraph className={styles.sectionContent}>
                  O tratamento de seus dados pessoais é baseado nas seguintes hipóteses legais da LGPD:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Consentimento:</strong> Para coleta e uso de dados pessoais sensíveis</li>
                  <li><strong>Execução de Contrato:</strong> Para prestação dos serviços contratados</li>
                  <li><strong>Interesse Legítimo:</strong> Para melhorias e segurança da plataforma</li>
                  <li><strong>Cumprimento de Obrigação Legal:</strong> Para atender determinações legais</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>5. Compartilhamento de Dados</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>5.1 Não Compartilhamos:</strong> Não vendemos, alugamos ou compartilhamos 
                  seus dados pessoais com terceiros para fins comerciais.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>5.2 Compartilhamento Técnico:</strong> Podemos compartilhar dados com:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Provedores de Serviços:</strong> Para hospedagem, backup e segurança</li>
                  <li><strong>Rede Blockchain:</strong> Hashes criptográficos são registrados na rede Besu privada</li>
                  <li><strong>Autoridades:</strong> Quando exigido por lei ou ordem judicial</li>
                </ul>
                <Paragraph className={styles.sectionContent}>
                  <strong>5.3 Compartilhamento Voluntário:</strong> Você pode optar por compartilhar 
                  seu histórico veicular via QR Code com compradores potenciais.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>6. Segurança dos Dados</Title>
                <Paragraph className={styles.sectionContent}>
                  Implementamos medidas técnicas e organizacionais para proteger seus dados:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Criptografia:</strong> Senhas são criptografadas com bcrypt</li>
                  <li><strong>Comunicação Segura:</strong> Uso obrigatório de HTTPS em produção</li>
                  <li><strong>Controle de Acesso:</strong> Autenticação JWT com tokens de duração limitada</li>
                  <li><strong>Isolamento de Dados:</strong> Cada usuário acessa apenas seus próprios dados</li>
                  <li><strong>Backup Seguro:</strong> Dados são armazenados com redundância</li>
                  <li><strong>Monitoramento:</strong> Logs de segurança e detecção de anomalias</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>7. Retenção de Dados</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.1 Dados Ativos:</strong> Mantemos seus dados enquanto sua conta estiver ativa 
                  e você utilizar o serviço.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.2 Dados na Blockchain:</strong> Hashes registrados na blockchain são 
                  mantidos permanentemente devido à natureza imutável da tecnologia.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.3 Dados de Logs:</strong> Logs de sistema são mantidos por até 1 ano 
                  para fins de segurança e auditoria.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.4 Exclusão:</strong> Após exclusão da conta, dados pessoais são removidos 
                  em até 30 dias, exceto os registros blockchain.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>8. Seus Direitos</Title>
                <Paragraph className={styles.sectionContent}>
                  Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                  <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
                  <li><strong>Anonimização ou Exclusão:</strong> Solicitar anonimização ou exclusão de dados</li>
                  <li><strong>Portabilidade:</strong> Solicitar a portabilidade de seus dados</li>
                  <li><strong>Informações:</strong> Obter informações sobre o compartilhamento de dados</li>
                  <li><strong>Revogação:</strong> Revogar o consentimento a qualquer momento</li>
                </ul>
                <Paragraph className={styles.sectionContent}>
                  Para exercer seus direitos, entre em contato conosco através dos canais disponíveis 
                  na plataforma.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>9. Cookies e Tecnologias Similares</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.1 Cookies Essenciais:</strong> Utilizamos cookies necessários para o 
                  funcionamento da plataforma, como manutenção de sessão.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.2 Cookies de Performance:</strong> Podemos usar cookies para analisar 
                  o uso da plataforma e melhorar a experiência.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.3 Controle:</strong> Você pode controlar cookies através das configurações 
                  do seu navegador.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>10. Menores de Idade</Title>
                <Paragraph className={styles.sectionContent}>
                  O AutoLogger não é destinado a menores de 18 anos. Não coletamos intencionalmente 
                  dados pessoais de menores. Se tomarmos conhecimento de que coletamos dados de 
                  menores, os removeremos imediatamente.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>11. Transferência Internacional</Title>
                <Paragraph className={styles.sectionContent}>
                  Seus dados são armazenados e processados no Brasil. Caso seja necessário transferir 
                  dados para outros países, garantiremos que a transferência seja feita com proteções 
                  adequadas conforme a LGPD.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>12. Alterações nesta Política</Title>
                <Paragraph className={styles.sectionContent}>
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre 
                  mudanças significativas através da plataforma ou por e-mail. Recomendamos que 
                  revise esta política regularmente.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>13. Encarregado de Dados (DPO)</Title>
                <Paragraph className={styles.sectionContent}>
                  Para questões relacionadas à proteção de dados pessoais, você pode entrar em contato 
                  com nosso Encarregado de Dados através dos canais disponíveis na plataforma.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>14. Contato</Title>
                <Paragraph className={styles.sectionContent}>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento 
                  de seus dados pessoais, entre em contato conosco através dos canais disponíveis 
                  na plataforma.
                </Paragraph>
              </div>

              <Divider />

              <div className={styles.footerText}>
                Esta Política de Privacidade está em conformidade com a Lei Geral de Proteção 
                de Dados (LGPD) e demais legislações aplicáveis no Brasil.
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
