import { useEffect, useState } from "react";
import Loading from "../loading";
import NotFound from "../not.found";
import NotPermitted from "./not-permitted";
import { useAppSelector } from "@/redux/hooks";

const RoleBaseRoute = ({ children }: { children: React.ReactNode }) => {
    const user = useAppSelector(state => state.account.user);
    const userRole = user?.role?.name;

    if (userRole && userRole !== 'NORMAL_USER') {
        return <>{children}</>;
    } else {
        return <NotPermitted />;
    }
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const { isAuthenticated, isLoading } = useAppSelector(state => state.account);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingTimeout(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    if (isLoading && !loadingTimeout) {
        return <Loading />;
    }

    if (!isAuthenticated) {
        return <NotFound />;
    }

    return (
        <RoleBaseRoute>
            {children}
        </RoleBaseRoute>
    );
};

export default ProtectedRoute;
