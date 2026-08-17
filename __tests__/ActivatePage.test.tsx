import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ActivatePage from '@/app/activate/page';

vi.mock('next/navigation', () => ({
    useSearchParams: () => ({
        get: (key: string) => {
            if (key === 'token') return 'test-token-123';
            if (key === 'email') return 'test@gmail.com';
            return null;
        }
    }),
    useRouter: () => ({
        push: vi.fn()
    })
}));

describe('ActivatePage', () => {
    it('renders activate page properly without errors', () => {
        render(<ActivatePage />);
        expect(screen.getByRole('heading', { name: /Activate Account/i })).toBeDefined();
        expect(screen.getByText(/Setting up password for/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Set Password & Activate Account/i })).toBeDefined();
    });
});
