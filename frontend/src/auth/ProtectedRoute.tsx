import type { ReactNode } from "react"
import { useAuth } from "./AuthContext"
import { Navigate } from "react-router-dom"

export default function ProtectedRoute({children} : {children: ReactNode})
{
    const auth = useAuth()

    if (auth?.loading)
    {
        return <Navigate to={'/'} />
    }

    if (!auth?.user)
    {
        return <Navigate to={'/landing'} /> 
    }
    
    return children
}