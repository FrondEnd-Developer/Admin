import PropTypes from 'prop-types';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { Controller, useFormContext } from 'react-hook-form';

import FormHelperText from '@mui/material/FormHelperText';

// ----------------------------------------------------------------------

export default function RHFCode({ name, onChange, ...other }) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div>
          <MuiOtpInput
            {...field}
            autoFocus
            gap={1.5}
            length={6}
            TextFieldsProps={{
              error: !!error,
              placeholder: '-',
            }}
            onChange={(value) => {
              field.onChange(value); // This is required to update the value in the form context
              if (onChange) {
                onChange(value); // Call the onChange handler from props
              }
            }}
            {...other}
          />

          {error && (
            <FormHelperText sx={{ px: 2 }} error>
              {error.message}
            </FormHelperText>
          )}
        </div>
      )}
    />
  );
}

RHFCode.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func,
};
