'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation } from '@tanstack/react-query'

import { HOME_ROUTE } from '@/lib/constants'
import { setSession, submitLogin } from '@/lib/services'
import { toast, useAuth } from '@/store'

export const useLogin = () => {
    const router = useRouter()
    const { setAuth } = useAuth()

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);

    /** Mutation */
    const login = useMutation({
        mutationFn: submitLogin,
    })
    /** End Mutation */

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }

    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        login.mutate(
            { email, password },
            {
                onSuccess: (data) => {
                    if (!data) return;

                    setSession(data);
                    setAuth(data.user);
                    router.replace(HOME_ROUTE);
                },
                onError: (error) => {
                    toast.error(error, "Unable to sign in");
                },
            },
        );
    }

    return {
        state: {
            email, password, showPassword, isSubmitting: login.isPending,
        },
        events: {
            handleEmailChange,
            handlePasswordChange,
            handleShowPassword,
            handleSubmit
        }
    }
}
