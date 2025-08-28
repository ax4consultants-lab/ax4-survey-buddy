import { describe, it, expect } from 'vitest';
import { 
  getRecommendationText, 
  getRecommendationDescription,
  getRecommendationsForType,
  getRecommendationCodes 
} from '@/domain/recommendations';

describe('Recommendations Engine', () => {
  describe('AMPR/AMPRU recommendations', () => {
    it('should return correct text for AMPR Monitor recommendation', () => {
      const text = getRecommendationText('AMPR', 'Monitor');
      expect(text).toContain('managed in place');
      expect(text).toContain('periodic inspection');
    });

    it('should return correct text for AMPR Remove recommendation', () => {
      const text = getRecommendationText('AMPR', 'Remove');
      expect(text).toContain('removed by licensed');
      expect(text).toContain('asbestos removal contractor');
    });

    it('should return correct description for Monitor recommendation', () => {
      const description = getRecommendationDescription('AMPR', 'Monitor');
      expect(description).toBe('Leave in place and monitor');
    });
  });

  describe('Pre-Demolition recommendations', () => {
    it('should return correct text for Demolition Remove recommendation', () => {
      const text = getRecommendationText('HSMR', 'Remove');
      expect(text).toContain('must be removed');
      expect(text).toContain('prior to demolition');
    });

    it('should return correct text for Demolition Monitor recommendation', () => {
      const text = getRecommendationText('HSMR', 'Monitor');
      expect(text).toContain('during demolition');
      expect(text).toContain('wet methods');
    });
  });

  describe('Available recommendations', () => {
    it('should return AMPR recommendations for AMPR document type', () => {
      const recommendations = getRecommendationsForType('AMPR');
      expect(recommendations).toHaveLength(4);
      expect(recommendations.map(r => r.code)).toContain('Monitor');
      expect(recommendations.map(r => r.code)).toContain('Remove');
    });

    it('should return recommendation codes for document type', () => {
      const codes = getRecommendationCodes('AMPR');
      expect(codes).toContain('Monitor');
      expect(codes).toContain('Remove');
      expect(codes).toContain('Repair');
      expect(codes).toContain('Encapsulate');
    });
  });

  describe('Fallback behavior', () => {
    it('should return empty string for unknown recommendation code', () => {
      const text = getRecommendationText('AMPR', 'UnknownCode');
      expect(text).toBe('');
    });

    it('should return empty string for unknown document type', () => {
      const text = getRecommendationText('UNKNOWN' as any, 'Monitor');
      expect(text).toBe('');
    });
  });
});