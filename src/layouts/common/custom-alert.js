import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';

import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

function CustomAlert({ childFunctionRef }) {
  const [show, setShow] = useState(false);
  const [content, setContent] = useState('');
  const [contentType, setContentType] = useState('success');

  CustomAlert.propTypes = {
    childFunctionRef: PropTypes.func,
  };

  const childFunction = (message, type) => {
    setContent(message);
    setContentType(type);
    setShow(true);
  };
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setShow(false);
  };
  useEffect(() => {
    childFunctionRef.current = childFunction;
  }, [childFunctionRef]);
  return (
    <div>
      <Snackbar
        open={show}
        autoHideDuration={2000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={handleClose}
      >
        <Alert severity={contentType} variant="filled" sx={{ width: '100%' }} onClose={handleClose}>
          {content}
        </Alert>
      </Snackbar>
    </div>
  );
}
export default CustomAlert;
