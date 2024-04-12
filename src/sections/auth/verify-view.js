'use client';

import * as Yup from 'yup';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useAuthContext } from 'src/auth/hooks';
import { EmailInboxIcon } from 'src/assets/icons';
import { PATH_AFTER_VERIFY } from 'src/config-global';
import CustomAlert from 'src/layouts/common/custom-alert';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function Classic() {
  const { verify } = useAuthContext();
  const [searchParams] = useSearchParams();

  const childFunctionRef = useRef(null);

  const router = useRouter();

  const VerifySchema = Yup.object().shape({
    otp: Yup.string().min(6, 'Otp must be at least 6 characters').required('Code is required'),
    toMail: Yup.string().required('Email is required').email('Email must be a valid email address'),
  });

  const defaultValues = {
    otp: '',
    toMail: 'example@gmail.com',
  };

  if (searchParams !== undefined) {
    defaultValues.toMail = searchParams[1];
  }

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(VerifySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await verify?.(data.toMail, data.otp);

      await new Promise((resolve) => setTimeout(resolve, 500));
      if (result.status === 200) {
        if (childFunctionRef.current) {
          childFunctionRef.current('Verification Successfull', 'success');
        }
      }
      setTimeout(() => {
        router.push(PATH_AFTER_VERIFY);
      }, 10);
    } catch (error) {
      console.error(error);
      if (childFunctionRef.current) {
        // console.error("status", childFunctionRef.current);
        childFunctionRef.current(`${error.detail}`, 'error');
      }

      reset();
    }
  });

  const handleOtpChange = (value) => {
    if (value.length === 6) {
      defaultValues.otp = value;
      onSubmit(defaultValues);
    }

    // Add any other action you want to perform with the OTP value here
  };

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField name="toMail" label="Email" InputLabelProps={{ shrink: true }} disabled />

      <RHFCode name="otp" onChange={handleOtpChange} />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Verify
      </LoadingButton>

      <Typography variant="body2">
        {`Don’t have a code? `}
        <Link
          variant="subtitle2"
          sx={{
            cursor: 'pointer',
          }}
        >
          Resend code
        </Link>
      </Typography>

      <Link
        component={RouterLink}
        href={paths.auth.login}
        color="inherit"
        variant="subtitle2"
        sx={{
          alignItems: 'center',
          display: 'inline-flex',
        }}
      >
        <Iconify icon="eva:arrow-ios-back-fill" width={16} />
        Return to sign in
      </Link>
    </Stack>
  );

  const renderHead = (
    <>
      <EmailInboxIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">Please check your email!</Typography>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          We have emailed a 6-digit confirmation code to acb@domain, please enter the code in below
          box to verify your email.
        </Typography>
      </Stack>
    </>
  );

  return (
    <>
      <CustomAlert childFunctionRef={childFunctionRef} message="Test Registration" type="success" />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderHead}

        {renderForm}
      </FormProvider>
    </>
  );
}
