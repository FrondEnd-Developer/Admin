import * as Yup from 'yup';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { useRef, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { fData } from 'src/utils/format-number';

import { useAuthContext } from 'src/auth/hooks';
import CustomAlert from 'src/layouts/common/custom-alert';
import { PATH_TO_RESTAURANT_LIST } from 'src/config-global';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFSwitch, RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export default function UserNewEditForm({ currentUser }) {
  const router = useRouter();
  const childFunctionRef = useRef(null);

  const { addRest } = useAuthContext();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    // email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    contactNumber: Yup.string().required('Phone number is required'),
    // address: Yup.string().required('Address is required'),
    // country: Yup.string().required('Country is required'),
    // company: Yup.string().required('Company is required'),
    // state: Yup.string().required('State is required'),
    location: Yup.string().required('City is required'),
    // role: Yup.string().required('Role is required'),
    // zipCode: Yup.string().required('Zip code is required'),
    restaurant_image: Yup.mixed().nullable().required('Avatar is required'),
    // not required
    status: Yup.string(),
    isVerified: Yup.boolean(),
  });

  const defaultValues = useMemo(
    () => ({
      name: currentUser?.name || '',
      location: currentUser?.location || '',
      // role: currentUser?.role || '',
      // email: currentUser?.email || '',
      // state: currentUser?.state || '',
      status: currentUser?.status || '',
      // address: currentUser?.address || '',
      // country: currentUser?.country || '',
      // zipCode: currentUser?.zipCode || '',
      // company: currentUser?.company || '',
      restaurant_image: currentUser?.restaurant_image || null,
      contactNumber: currentUser?.contactNumber || '',
      // isVerified: currentUser?.isVerified || true,
    }),
    [currentUser]
  );

  const methods = useForm({
    resolver: yupResolver(NewUserSchema),
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const { restaurant_image } = data;
      const result = await addRest?.(
        data.name,
        data.location,
        restaurant_image,
        data.contactNumber
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (result.status === 200) {
        if (childFunctionRef.current) {
          childFunctionRef.current('Restaurant Added Successfully', 'success');
        }
      }
      reset();
      enqueueSnackbar(currentUser ? 'Update success!' : 'Create success!');
      setTimeout(() => {
        router.push(PATH_TO_RESTAURANT_LIST);
      }, 1000);
      console.info('DATA', data);
    } catch (error) {
      console.error('Error occurred while submitting the form:', error);
      if (childFunctionRef.current) {
        console.error('status', childFunctionRef.current);
        childFunctionRef.current(`${error.detail}`, 'error');
      }
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      });

      if (file) {
        setValue('restaurant_image', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  return (
    <>
      <CustomAlert childFunctionRef={childFunctionRef} message="Test Registration" type="success" />

      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Grid container spacing={3}>
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              {currentUser && (
                <Label
                  color={
                    (values.status === 'true' && 'success') ||
                    (values.status === 'false' && 'error') ||
                    'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {values.status}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
                <RHFUploadAvatar
                  name="restaurant_image"
                  maxSize={3145728}
                  onDrop={handleDrop}
                  type="file"
                  helperText={
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 3,
                        mx: 'auto',
                        display: 'block',
                        textAlign: 'center',
                        color: 'text.disabled',
                      }}
                    >
                      Allowed *.jpeg, *.jpg, *.png, *.gif
                      <br /> max size of {fData(3145728)}
                    </Typography>
                  }
                />
              </Box>

              {currentUser && (
                <FormControlLabel
                  labelPlacement="start"
                  control={
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <Switch
                          {...field}
                          checked={field.value !== 'true'}
                          onChange={(event) =>
                            field.onChange(event.target.checked ? 'false' : 'true')
                          }
                        />
                      )}
                    />
                  }
                  label={
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        Banned
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Apply disable account
                      </Typography>
                    </>
                  }
                  sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
                />
              )}

              <RHFSwitch
                name="isVerified"
                labelPlacement="start"
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Email Verified
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Disabling this will automatically send the user a verification email
                    </Typography>
                  </>
                }
                sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
              />

              {currentUser && (
                <Stack justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                  <Button variant="soft" color="error">
                    Delete User
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>

          <Grid xs={12} md={8}>
            <Card sx={{ p: 3 }}>
              <Box
                rowGap={3}
                columnGap={2}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  sm: 'repeat(2, 1fr)',
                }}
              >
                <RHFTextField name="name" label="Full Name" />
                {/* <RHFTextField name="email" label="Email Address" /> */}
                <RHFTextField name="contactNumber" label="Phone Number" />
                <RHFTextField name="location" label="City" />

                {/* <RHFAutocomplete
                  name="country"
                  type="country"
                  label="Country"
                  placeholder="Choose a country"
                  fullWidth
                  options={countries.map((option) => option.label)}
                  getOptionLabel={(option) => option}
                /> */}

                {/* <RHFTextField name="state" label="State/Region" /> */}
                {/* <RHFTextField name="address" label="Address" />
                <RHFTextField name="zipCode" label="Zip/Code" />
                <RHFTextField name="company" label="Company" />
                <RHFTextField name="role" label="Role" /> */}
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentUser ? 'Create User' : 'Save Changes'}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}

UserNewEditForm.propTypes = {
  currentUser: PropTypes.object,
};
