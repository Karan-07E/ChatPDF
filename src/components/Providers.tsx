"use client";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type Props = {
    children: React.ReactNode;
};

const queryClient = new QueryClient();

const Providers = ({ children }: Props) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

export default Providers;

//purpose of this is to cache and manage server state across the app using react query. We wrap our entire app with this provider in layout.tsx so that any component can use react query hooks to fetch and manage data.
