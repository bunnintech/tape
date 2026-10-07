import { useLocalSearchParams } from 'expo-router';

import CompanyScreen from '@/features/company/CompanyScreen';

export default function CompanyRoute() {
  const { ticker } = useLocalSearchParams<{ ticker: string }>();
  return <CompanyScreen assetId={String(ticker).toUpperCase()} />;
}
