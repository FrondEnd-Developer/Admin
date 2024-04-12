'use client';

import * as Yup from 'yup';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter, useSearchParams } from 'next/navigation';

import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { SentIcon } from 'src/assets/icons';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_REGISTER } from 'src/config-global';
import CustomAlert from 'src/layouts/common/custom-alert';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function ClassicNewPasswordView() {
  const newPassword = useBoolean();
  const searchParams = useSearchParams();
  const searchEmail = searchParams.get('email');
  const token = searchParams.get('reset_token');

  const { resetPassword } = useAuthContext();
  const router = useRouter();

  const childFunctionRef = useRef(null);

  const NewPasswordSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    newPassword: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .required('Confirm password is required')
      .oneOf([Yup.ref('newPassword')], 'Passwords must match'),
  });

  const defaultValues = {
    email: searchEmail,
    newPassword: '',
    confirmPassword: '',
  };

  const methods = useForm({
    mode: 'onChange',
    resolver: yupResolver(NewPasswordSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const result = await resetPassword?.(data.newPassword, data.confirmPassword, data.email, {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      //   console.info('DATA', data);
      if (result.status === 200) {
        if (childFunctionRef.current) {
          childFunctionRef.current('Password Updated Successfully', 'success');
        }
      }
      setTimeout(() => {
        router.push(PATH_AFTER_REGISTER);
      }, 10);
    } catch (error) {
      console.error(error);
      if (childFunctionRef.current) {
        // console.error("status", childFunctionRef.current);
        childFunctionRef.current(`${error.detail}`, 'error');
      }
    }
  });

  const renderForm = (
    <Stack spacing={3} alignItems="center">
      <RHFTextField
        name="email"
        label="Email"
        disabled
        placeholder="example@gmail.com"
        InputLabelProps={{ shrink: true }}
      />

      <RHFTextField
        name="newPassword"
        label="new Password"
        type={newPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPassword.onToggle} edge="end">
                <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <RHFTextField
        name="confirmPassword"
        label="Confirm New Password"
        type={newPassword.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={newPassword.onToggle} edge="end">
                <Iconify icon={newPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
      >
        Update Password
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
      <SentIcon sx={{ height: 96 }} />

      <Stack spacing={1} sx={{ mt: 3, mb: 5 }}>
        <Typography variant="h3">Request sent successfully!</Typography>
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
