'use client';

import { useDatabase } from '@/contexts/databaseContext';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'

const Onboarding = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        userName: '',
        dateOfBirth: '',
    });
    const {user} = useUser();
    const {setUserData} = useDatabase();
    const userMail = user?.emailAddresses[0].emailAddress || '';
    const userImageUrl = user?.imageUrl || '';

    useEffect(() => {
        document.body.dataset.skipSessionEnforcer = 'true';
        return () => {
            delete document.body.dataset.skipSessionEnforcer;
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [e.target.name]: e.target.value});
    };

    const submitUserData = useCallback(async (): Promise<boolean> => {
        const userId = user?.id;
        if(!userId){
            console.log('User ID not found');
            return false;
        }
        const result = await setUserData(
            form.userName,
            userImageUrl,
            userMail,
            form.dateOfBirth,
            userId
        );
        if(result){
            console.log('User data set successfully');
            return true;
        }else{
            console.log('User data not set');
            return false;
        }
    }, [form, user, setUserData, userImageUrl, userMail]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        const isSuccess = await submitUserData();
        setIsSubmitting(false);
        if (isSuccess) {
            router.refresh();
        }
    };

  return (
    <div className = 'fixed inset-0 z-40 flex items-center justify-center bg-twitch-ice bg-opacity-50'>
        <div className = 'bg-white text-gray-700 rounded-lg shadow-lg p-8 w-full max-w-md relative'>
                <h2 className='text-2xl font-bold mb-6 text-center'>Onboarding</h2>
                <form onSubmit = {handleSubmit} className = 'space-y-4'>
                    <div>
                        <label  
                            htmlFor='userName'
                            className = 'block text-sm font-medium mb-1'
                            >Username
                            </label>
                            <input
                                type = 'text'
                                id = 'userName'
                                name = 'userName'
                                value = {form.userName}
                                onChange = {handleChange}
                                required
                                className = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus: ring-2 focus: ring-purple-500'
                                />
                    </div>

                    <div>
                        <label htmlFor='mail' className = 'block text-sm font-medium mb-1'>
                            Email
                        </label>
                        <input
                            type = 'email'
                            id = 'mail'
                            name = 'mail'
                            value = {userMail}
                            onChange = {handleChange}
                            required
                            disabled = {true}
                            className = {`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus: ring-2 focus: ring-purple-500
                                ${userMail !== '' ? 'bg-gray-100 opacity-70' : ''}`}
                            />
                    </div>
                    <div>
                        <label
                            htmlFor = 'dateOfBirth'
                            className = 'block text-sm font-medium mb-1'
                        >
                            Date of Birth
                        </label>
                        <input
                            type = 'date'
                            id = 'dateOfBirth'
                            name = 'dateOfBirth'
                            value = {form.dateOfBirth}
                            onChange = {handleChange}
                            required
                            className = 'w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus: ring-2 focus: ring-purple-500'
                            />
                    </div>
                    <button
                        type = 'submit'
                        disabled = {isSubmitting}
                        className = 'w-full bg-purple-600 text-white py-2 rounded font-semibold hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed'
                        >{isSubmitting ? 'Submitting...' : 'Submit'}</button>
                </form>
        </div>
      
    </div>
  )
}

export default Onboarding;
