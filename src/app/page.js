'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';

import { PATH_AFTER_VERIFY } from 'src/config-global';

// ----------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push(PATH_AFTER_VERIFY);
  }, [router]);

  return null;
}
