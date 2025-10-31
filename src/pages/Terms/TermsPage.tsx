import { Card, Typography, Divider, Space } from 'antd';
import styles from './TermsPage.module.css';

const { Title, Paragraph, Text } = Typography;

export default function TermsPage() {
  return (
    <div className={styles.termsContainer}>
      <div className={styles.termsContent}>
        <Card className={styles.termsCard}>
          <div className={styles.termsHeader}>
            <Title level={2} className={styles.termsTitle}>
              Termos de Uso
            </Title>
            <Text className={styles.termsSubtitle}>AutoLogger - Sistema de Gestão Veicular</Text>
            <div className={styles.lastUpdate}>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div className={styles.contentArea}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={3} className={styles.sectionTitle}>1. Aceitação dos Termos</Title>
                <Paragraph className={styles.sectionContent}>
                  Ao acessar e utilizar o AutoLogger, você concorda em cumprir e estar vinculado aos 
                  presentes Termos de Uso. Se você não concordar com qualquer parte destes termos, 
                  não deve utilizar nosso serviço.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>2. Descrição do Serviço</Title>
                <Paragraph className={styles.sectionContent}>
                  O AutoLogger é uma plataforma web para gestão de histórico veicular que utiliza 
                  tecnologia blockchain para garantir o registro imutável e transparente de serviços 
                  e despesas automotivas. Nossa plataforma permite:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li>Cadastro e gestão de veículos pessoais</li>
                  <li>Registro de serviços e despesas veiculares</li>
                  <li>Armazenamento seguro de documentos e comprovantes</li>
                  <li>Geração de relatórios e análises de gastos</li>
                  <li>Registro imutável de eventos na blockchain privada Besu</li>
                  <li>Compartilhamento de histórico veicular via QR Code</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>3. Elegibilidade</Title>
                <Paragraph className={styles.sectionContent}>
                  Para utilizar o AutoLogger, você deve:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li>Ter pelo menos 18 anos de idade</li>
                  <li>Fornecer informações verdadeiras e precisas durante o cadastro</li>
                  <li>Ser responsável por manter a segurança de sua conta</li>
                  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>4. Conta de Usuário</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>4.1 Cadastro:</strong> Para utilizar o AutoLogger, você deve criar uma conta 
                  fornecendo nome completo, endereço de e-mail válido e senha segura.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>4.2 Limite de Veículos:</strong> Cada usuário pode cadastrar até 2 veículos 
                  ativos simultaneamente. Veículos vendidos são movidos para a seção "Veículos Anteriores".
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>4.3 Responsabilidade:</strong> Você é responsável por todas as atividades 
                  que ocorrem em sua conta e deve manter a confidencialidade de suas credenciais.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>5. Uso Aceitável</Title>
                <Paragraph className={styles.sectionContent}>
                  Você concorda em não utilizar o AutoLogger para:
                </Paragraph>
                <ul className={styles.sectionList}>
                  <li>Atividades ilegais ou não autorizadas</li>
                  <li>Interferir no funcionamento do serviço</li>
                  <li>Tentar acessar contas de outros usuários</li>
                  <li>Enviar spam ou conteúdo malicioso</li>
                  <li>Falsificar informações veiculares</li>
                  <li>Violar direitos de propriedade intelectual</li>
                </ul>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>6. Dados e Conteúdo</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>6.1 Seus Dados:</strong> Você mantém a propriedade de todos os dados que 
                  insere no AutoLogger, incluindo informações de veículos e serviços.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>6.2 Registro na Blockchain:</strong> Ao confirmar um serviço, um hash 
                  criptográfico é registrado na blockchain privada Besu, tornando o registro imutável. 
                  Esta ação não pode ser desfeita.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>6.3 Veracidade:</strong> O AutoLogger registra apenas as informações 
                  fornecidas por você, sem validar sua veracidade. Você é responsável pela precisão 
                  dos dados inseridos.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>7. Tecnologia Blockchain</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.1 Rede Privada:</strong> Utilizamos uma rede blockchain privada Besu 
                  com consenso QBFT para garantir a integridade dos registros.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.2 Imutabilidade:</strong> Uma vez registrado na blockchain, os dados 
                  não podem ser alterados ou excluídos, garantindo a autenticidade do histórico.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>7.3 Disponibilidade:</strong> Embora nos esforcemos para manter a rede 
                  blockchain disponível, não garantimos sua operação contínua.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>8. Privacidade e Proteção de Dados</Title>
                <Paragraph className={styles.sectionContent}>
                  Sua privacidade é importante para nós. Consulte nossa Política de Privacidade 
                  para entender como coletamos, usamos e protegemos suas informações pessoais, 
                  em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>9. Limitações de Responsabilidade</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.1 Uso por Sua Conta e Risco:</strong> O AutoLogger é fornecido "como está" 
                  e "conforme disponível". Não garantimos que o serviço atenderá às suas necessidades 
                  ou estará disponível de forma ininterrupta.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.2 Limitação de Danos:</strong> Em nenhuma circunstância seremos 
                  responsáveis por danos diretos, indiretos, incidentais ou consequenciais 
                  resultantes do uso do AutoLogger.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>9.3 Veracidade dos Dados:</strong> Não somos responsáveis pela veracidade 
                  ou precisão das informações inseridas pelos usuários.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>10. Modificações do Serviço</Title>
                <Paragraph className={styles.sectionContent}>
                  Reservamo-nos o direito de modificar, suspender ou descontinuar o AutoLogger 
                  a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis por 
                  qualquer modificação, suspensão ou descontinuação do serviço.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>11. Modificações dos Termos</Title>
                <Paragraph className={styles.sectionContent}>
                  Podemos modificar estes Termos de Uso a qualquer momento. As modificações 
                  entrarão em vigor imediatamente após a publicação. Seu uso continuado do 
                  AutoLogger após as modificações constitui aceitação dos novos termos.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>12. Rescisão</Title>
                <Paragraph className={styles.sectionContent}>
                  <strong>12.1 Por Você:</strong> Você pode encerrar sua conta a qualquer momento 
                  através das configurações da conta.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>12.2 Por Nós:</strong> Podemos suspender ou encerrar sua conta se você 
                  violar estes Termos de Uso ou por qualquer outro motivo, a nosso critério.
                </Paragraph>
                <Paragraph className={styles.sectionContent}>
                  <strong>12.3 Efeitos da Rescisão:</strong> Após a rescisão, você perderá o 
                  acesso à sua conta e dados, exceto os registros já confirmados na blockchain.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>13. Lei Aplicável</Title>
                <Paragraph className={styles.sectionContent}>
                  Estes Termos de Uso são regidos pelas leis brasileiras. Qualquer disputa 
                  será resolvida nos tribunais competentes do Brasil.
                </Paragraph>
              </div>

              <div>
                <Title level={3} className={styles.sectionTitle}>14. Contato</Title>
                <Paragraph className={styles.sectionContent}>
                  Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através 
                  dos canais disponíveis na plataforma.
                </Paragraph>
              </div>

              <Divider />

              <div className={styles.footerText}>
                Ao utilizar o AutoLogger, você confirma que leu, entendeu e concorda com 
                estes Termos de Uso.
              </div>
            </Space>
          </div>
        </Card>
      </div>
    </div>
  );
}
