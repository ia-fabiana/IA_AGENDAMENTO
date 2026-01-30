
/**
 * MERCADO PAGO SERVICE - PRODUÇÃO
 * Utiliza o SDK oficial injetado via index.html
 */

declare const MercadoPago: any;

export const mercadopagoService = {
  // Em produção, isso chamaria uma Edge Function do Supabase para criar a preferência
  // Aqui simulamos a resposta do servidor mas preparamos a UI para o retorno real
  async createPreference(pack: { id: string, price: number, msgs: number }) {
    console.log(`[MP] Criando preferência para o pacote ${pack.id} - R$ ${pack.price}`);
    
    // Simulação de chamada de backend (Onde o Access Token estaria seguro)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      id: `pref_${Math.random().toString(36).substring(7)}`,
      init_point: `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123`,
      qr_code: "00020126360014BR.GOV.BCB.PIX0114MPRECARGASAAS001", // PIX Estático para Demo de Produção
      qr_code_base64: "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEAAQMAAABmvDolAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAADRJREFUeAFjGAWjYBSMglEwCkbBKJg4wH9gAIKBaID/YAAEgWCA/2AABIFggP9gAASBYID/YAAEgWCAn5ID+AIAAAAASUVORK5CYII="
    };
  }
};
