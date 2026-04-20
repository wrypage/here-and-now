// Font family keys — match names registered with expo-font in app/_layout.tsx
export const fontFamilies = {
  bcBarell: 'BCBarellTEST-Regular',
  bcBarell1973: 'BCBarellTEST-1973',
  bcBarellCondensedThin: 'BCBarellTEST-CondensedThin',
  bcBarellExtendedBlack: 'BCBarellTEST-ExtendedBlack',
  bcBarellInline: 'BCBarellTEST-Inline',
  addressSansPro: 'AddressSansPro-Regular',
  dmSansLight: 'DMSans_300Light',
  dmMono: 'DMMono_400Regular',
} as const;

// Typography tokens — spec section 6
// BC Barell        = channel identity, wordmark, primary display
// Address Sans Pro = temperature, city label, location labels
// DM Sans Light    = condition line, narrative copy
// DM Mono          = technical readouts, timestamps, live indicators, data strip
export const typography = {
  displayXXL: { fontFamily: fontFamilies.bcBarell, fontSize: 72, lineHeight: 80 },
  displayXL:  { fontFamily: fontFamilies.bcBarell, fontSize: 56, lineHeight: 64 },
  displayL:   { fontFamily: fontFamilies.bcBarell, fontSize: 40, lineHeight: 48 },
  displayM:   { fontFamily: fontFamilies.addressSansPro, fontSize: 28, lineHeight: 34 },
  labelL:     { fontFamily: fontFamilies.addressSansPro, fontSize: 22, lineHeight: 28 },
  labelM:     { fontFamily: fontFamilies.addressSansPro, fontSize: 18, lineHeight: 24 },
  bodyM:      { fontFamily: fontFamilies.dmSansLight, fontSize: 18, lineHeight: 26 },
  bodyS:      { fontFamily: fontFamilies.dmSansLight, fontSize: 14, lineHeight: 20 },
  monoS:      { fontFamily: fontFamilies.dmMono, fontSize: 12, lineHeight: 16 },
  monoXS:     { fontFamily: fontFamilies.dmMono, fontSize: 10, lineHeight: 14 },
  tempDisplay: { fontFamily: fontFamilies.addressSansPro, fontSize: 80, lineHeight: 88 },
} as const;
