import React from 'react';
import cx from 'classnames';

const ErrorMessage: React.FC<{
  errorMessage: string;
  canReload: boolean
  disabled: boolean
  className?: Record<string, any>
}> = ({disabled, errorMessage, canReload, className}) => {
  if(disabled) {
    return null;
  }

  let classes = cx(Object.assign({}, className, {
    'alert': true,
  }));

  let reload = !canReload || (
      <span>
        <button
            onClick={(ev) => { ev.preventDefault(); window.location.reload(); } }
        >
          Klikk her for å prøve igjen
        </button>
      </span>
    );

  return (
    <div className={classes}>
      <section style={{marginBottom: '1rem'}}><span>{errorMessage}</span></section>
      <section>{reload}</section>
    </div>
  );
};

export default ErrorMessage;