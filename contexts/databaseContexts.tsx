import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {createContext, useCallback, useContext, useState} from 'react';
type DatabaseContextType = {
    supabase: SupabaseClient | null;
    error: string | null;
    setSupabaseClient: (accessToken: string) => void;
};

export const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [error, setError] = useState<string | null>(null);

    const setSupabaseClient = useCallback((accessToken: string): void => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if(!supabaseUrl || !supabaseAnonKey){
            throw new Error('Missing Supabase environment variables');
        }
        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            accessToken: async () => accessToken,
        });

        setSupabase(supabaseClient);
    }, []);

    return (
        <DatabaseContext.Provider
        value = {{
            supabase,
            error,
            setSupabaseClient,
        }}>
        {children}
        </DatabaseContext.Provider>
    );
}

export const useDatabase = () => {
    const context = useContext(DatabaseContext);
    if(!context){
        throw new Error('useDatabase must be used within a DatabaseProvider');
    };
    return context;
}