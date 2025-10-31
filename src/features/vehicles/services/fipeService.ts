import axios from 'axios';
import { FipeBrand, FipeModel, FipeVehicle, FipeYear } from '../types/fipe.types';

export class FipeService {
    private static readonly BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

    /**
     * Buscar todas as marcas de carros
     */
    static async getBrands(): Promise<FipeBrand[]> {
        try {
            const response = await axios.get<FipeBrand[]>(`${this.BASE_URL}/carros/marcas`);
            const brands = response.data;

            return brands.sort((a, b) => {
                return a.nome.localeCompare(b.nome);
            });
        } catch (error) {
            console.error('Erro ao buscar marcas FIPE:', error);
            throw new Error('Não foi possível carregar as marcas de veículos');
        }
    }

    /**
     * Buscar modelos por marca
     */
    static async getModelsByBrand(brandCode: string): Promise<FipeModel[]> {
        try {
            const response = await axios.get<{ modelos: FipeModel[] }>(
                `${this.BASE_URL}/carros/marcas/${brandCode}/modelos`
            );

            return response.data.modelos.sort((a, b) => a.nome.localeCompare(b.nome));
        } catch (error) {
            console.error('Erro ao buscar modelos FIPE:', error);
            throw new Error('Não foi possível carregar os modelos');
        }
    }

    /**
     * Buscar anos por marca e modelo
     */
    static async getYearsByBrandAndModel(brandCode: string, modelCode: number): Promise<FipeYear[]> {
        try {
            const response = await axios.get<FipeYear[]>(
                `${this.BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos`
            );

            return response.data.sort((a, b) => parseInt(b.nome) - parseInt(a.nome));
        } catch (error) {
            console.error('Erro ao buscar anos FIPE:', error);
            throw new Error('Não foi possível carregar os anos');
        }
    }

    /**
     * Buscar informações completas do veículo
     */
    static async getVehicleInfo(
        brandCode: string,
        modelCode: number,
        yearCode: string
    ): Promise<FipeVehicle> {
        try {
            const response = await axios.get<FipeVehicle>(
                `${this.BASE_URL}/carros/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`
            );

            return response.data;
        } catch (error) {
            console.error('Erro ao buscar info do veículo FIPE:', error);
            throw new Error('Não foi possível carregar as informações do veículo');
        }
    }

    /**
     * Extrair ano numérico do código FIPE
     */
    static extractYear(fipeYearName: string): number {
        const yearMatch = fipeYearName.match(/^(\d{4})/);
        return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
    }

    /**
     * Formatar valor FIPE
     */
    static formatFipeValue(value: string): string {
        return value.replace('R$', '').trim();
    }

    /**
     * Buscar marcas com cache local (otimização)
     */
    static async getBrandsWithCache(): Promise<FipeBrand[]> {
        try {
            const cacheKey = 'fipe_brands';
            const cached = localStorage.getItem(cacheKey);

            if (cached) {
                try {
                    const { data, timestamp } = JSON.parse(cached);
                    const isExpired = Date.now() - timestamp > 24 * 60 * 60 * 1000;

                    if (!isExpired) {
                        return data;
                    }
                } catch (error) {
                    localStorage.removeItem(cacheKey);
                }
            }

            const brands = await this.getBrands();
            localStorage.setItem(cacheKey, JSON.stringify({
                data: brands,
                timestamp: Date.now()
            }));

            return brands;
        } catch (error) {
            console.warn('Erro no cache, buscando diretamente:', error);
            return await this.getBrands();
        }
    }

    /**
     * Limpar cache (útil para debug ou atualização forçada)
     */
    static clearCache(): void {
        try {
            localStorage.removeItem('fipe_brands');
        } catch (error) {
            console.warn('Erro ao limpar cache:', error);
        }
    }

    /**
     * Validar se os dados FIPE estão disponíveis
     */
    static async checkApiAvailability(): Promise<boolean> {
        try {
            await axios.get(`${this.BASE_URL}/carros/marcas`, { timeout: 5000 });
            return true;
        } catch (error) {
            console.warn('API FIPE indisponível:', error);
            return false;
        }
    }
}