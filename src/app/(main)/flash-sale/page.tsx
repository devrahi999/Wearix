import { Metadata } from 'next';
import FlashSaleClient from './FlashSaleClient';
import { SITE_NAME, SITE_URL } from '@/constants';

const title = `Flash Sale | ${SITE_NAME}`;
const description = `Don't miss out on our limited time Flash Sale at ${SITE_NAME}. Grab your favorite fashion items before they run out!`;
const url = `${SITE_URL}/flash-sale`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: url,
  },
  openGraph: {
    title,
    description,
    url,
    type: 'website',
  },
};

export default function FlashSalePage() {
  return <FlashSaleClient />;
}
