import React from 'react';

const Select = ({ children, ...props }) => <select {...props}>{children}</select>;

export default Select;
