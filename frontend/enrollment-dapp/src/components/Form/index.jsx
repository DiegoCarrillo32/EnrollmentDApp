import React from 'react'
import styles from './form.module.css'
export const Form = ({children, ref, onSubmit}) => {
  return (
    <form ref={ref} onSubmit={(e)=>{
        onSubmit(e)
    }}  className={styles.form}>
        {children}
    </form>
  )
}
