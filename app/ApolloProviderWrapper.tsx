'use client';

import React, { useMemo } from 'react';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';

export default function ApolloProviderWrapper({ children }: { children: React.ReactNode }) {
    const client = useMemo(() => {
        return new ApolloClient({
            link: new HttpLink({
                uri: typeof window === 'undefined' ? 'http://localhost:3002/graphql' : '/graphql',
            }),
            cache: new InMemoryCache(),
        });
    }, []);

    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
