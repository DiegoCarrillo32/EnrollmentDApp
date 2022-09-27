import React from 'react'
import styles from './container.module.css'
const Container = ({children}) => {
  return (
    <section className={styles.container}>
        <h1>DAPPiversity</h1>
        {
          children
        }
    </section>
  )
}

export default Container