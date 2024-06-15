import { TransportModeSchema } from "./types";

describe('Types API', function () {
    it('should handle known types', () => {
        expect(TransportModeSchema.safeParse('bus').success).toBe(true);
        expect(TransportModeSchema.safeParse('metro').success).toBe(true);
        expect(TransportModeSchema.safeParse('tram').success).toBe(true);
        expect(TransportModeSchema.safeParse('train').success).toBe(true);
    });
    it('should handle unknown types', () => {
        expect(TransportModeSchema.safeParse('cdsafdsafdsa').success).toBe(true);
        expect(TransportModeSchema.parse('cdsafdsafdsa')).toBe('cdsafdsafdsa');
    });
})