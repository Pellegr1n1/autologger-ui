export const getColorHex = (color: string): string => {
  const colorMap: Record<string, string> = {
    'branco': '#f0f0f0',
    'preto': '#000000',
    'prata': '#c0c0c0',
    'cinza': '#808080',
    'azul': '#1890ff',
    'vermelho': '#f5222d',
    'verde': '#52c41a',
    'amarelo': '#fadb14',
    'marrom': '#8b4513',
    'bege': '#f5f5dc',
    'roxo': '#722ed1',
    'laranja': '#fa8c16',
    'rosa': '#eb2f96',
    'dourado': '#d4af37'
  };
  return colorMap[color.toLowerCase()] || '#8c8c8c';
};

