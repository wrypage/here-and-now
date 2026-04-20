import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { DMSans_300Light } from '@expo-google-fonts/dm-sans';
import { DMMono_400Regular } from '@expo-google-fonts/dm-mono';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../src/theme/colors';
import { REFRESH } from '../src/utils/constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: REFRESH.weatherIntervalMs,
      retry: 2,
    },
  },
});

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * RootLayout — loads custom and Google fonts, provides QueryClient.
 * Renders a dark branded loading sky while fonts are loading.
 */
export function RootLayout({ children }: RootLayoutProps): React.ReactElement | null {
  const [fontsLoaded, fontError] = useFonts({
    // Keys must match each font's PostScript name so iOS resolves them correctly
    'BCBarellTEST-Regular':       require('../assets/fonts/BCBarellTEST-Regular.otf'),
    'BCBarellTEST-1973':          require('../assets/fonts/BCBarellTEST-1973.otf'),
    'BCBarellTEST-CondensedThin': require('../assets/fonts/BCBarellTEST-CondensedThin.otf'),
    'BCBarellTEST-ExtendedBlack': require('../assets/fonts/BCBarellTEST-ExtendedBlack.otf'),
    'BCBarellTEST-Inline':        require('../assets/fonts/BCBarellTEST-Inline.otf'),
    // PostScript name from fc-query: AddressSansPro-Regular
    'AddressSansPro-Regular':     require('../assets/fonts/address-sans-pro.otf'),
    // Google Fonts — DM Sans Light and DM Mono
    DMSans_300Light,
    DMMono_400Regular,
  });

  if (fontError) {
    console.error('[HERE & NOW] Font load error:', fontError);
  }
  console.log('[HERE & NOW] Fonts loaded:', fontsLoaded, '| error:', fontError ?? 'none');

  if (!fontsLoaded) {
    // Hold a plain dark sky while fonts load — avoids flash of unstyled text
    return (
      <LinearGradient
        colors={['#000005', '#020210', '#0a0a14']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
