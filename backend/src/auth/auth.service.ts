import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthLoginResultDto, AuthUserDto } from './dto/auth-user.dto';

@Injectable()
export class AuthService {
    constructor(private readonly supabaseService: SupabaseService) { }

    private get client() {
        return this.supabaseService.getClient();
    }

    private async getProfile(id: string) {
        const { data } = await this.client
            .from('profiles')
            .select('role, full_name')
            .eq('id', id)
            .single();
        return data;
    }

    private mapUser(user: {
        id: string;
        email?: string;
        user_metadata?: { full_name?: string };
    }, profile?: { role?: string; full_name?: string } | null): AuthUserDto {
        return {
            id: user.id,
            email: user.email,
            name: profile?.full_name || user.user_metadata?.full_name || 'User',
            role: profile?.role || 'cashier',
        };
    }

    async login(email: string, pass: string): Promise<AuthLoginResultDto> {
        const { data, error } = await this.client.auth.signInWithPassword({
            email,
            password: pass,
        });

        if (error) {
            throw new UnauthorizedException(error.message);
        }

        const profile = await this.getProfile(data.user.id);

        return {
            user: this.mapUser(data.user, profile),
            session: data.session,
        };
    }

    async logout() {
        const { error } = await this.client.auth.signOut();
        if (error) throw error;
        return { success: true };
    }

    async getMe(token: string): Promise<AuthUserDto> {
        const { data: { user }, error } = await this.client.auth.getUser(token);
        if (error || !user) throw new UnauthorizedException('Invalid token');

        const profile = await this.getProfile(user.id);
        return this.mapUser(user, profile);
    }
}
