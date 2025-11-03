import {createClient, SupabaseClient} from '@supabase/supabase-js';
import {createContext, useCallback, useContext, useState} from 'react';
import type { Tables } from '@/database/database.types';

type DatabaseContextType = {
    supabase: SupabaseClient | null;
    error: string | null;
    setSupabaseClient: (accessToken: string) => void;
    getUserData: (
        userId: string,
        field?:string,
    ) => Promise<Tables<'users'> | null>;
    setUserData: (
        userName: string,
        imageUrl: string,
        mail: string,
        dateOfBirth: string,
        userId: string
    ) => Promise<Tables<'users'> | null>;
    setUserInterests: (
        interests: string[],
        userId: string
    ) => Promise<Tables<'users'> | null>;
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

    const getUserData = useCallback(
        async (
            userId: string,
            field: string = 'user_id'
        ): Promise<Tables<'users'> | null> => {
            console.log('Getting user data from supabase: ',
                supabase,
                'for userId: ',
                userId
            );
            if(!supabase) {
                return null;
            }
            try{
                const {data, error} = await supabase.from('users').select('*').ilike(field, `%${userId}`).single();

                console.log('User data: ', data);
                if(error){
                    console.error('Error getting user data', error);
                    setError(`Error getting user data:  ${error.message}`);
                    return null;
                }
                return data;
            } catch(error){
                console.error('Error getting user data', error);
                return null;
            }
        },[supabase]);

        const setUserData = useCallback( async ( 
            userName: string,
            imageUrl: string,
            mail: string,
            dateOfBirth: string,
            userId: string
        ): Promise<Tables<'users'> | null> => {
            if(!supabase){
                return null;
            }
            const {data, error} = await supabase.from('users').insert({
                user_name: userName,
                image_url: imageUrl,
                mail: mail,
                date_of_birth: dateOfBirth,
                user_id: userId,
                following: [],
                followers: [],
            })
            .select()
            .single();
            if(error) {
                console.error('Error setting user data', error);
                setError(`Error setting user data: ${error.message}`);
                return null;
            }
            return data as Tables<'users'>;
        },
        [supabase]);

        const setUserInterests = useCallback(
            async (
                interests: string[],
                userId: string
            ): Promise<Tables<'users'> | null> => {
                if(!supabase) return null;
                const {data, error} = await supabase.from('users').update({interests: interests}).eq('user_id', userId).select().single();
                if(error){
                    console.error('Error setting user interests', error);
                    setError(`Error setting user interests: ${error.message}`);
                    return null;
                }
                return data as Tables<'users'>;
            },
            [supabase]
        );

    return (
        <DatabaseContext.Provider
        value = {{
            supabase,
            error,
            setSupabaseClient,
            getUserData,
            setUserData,
            setUserInterests
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