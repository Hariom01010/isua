import React from 'react'
import Image from 'next/image'
import styles from "./Navbar.module.css"

function Navbar() {
  return (
    <div className={styles.mainDiv}>
        <Image src="/logo.png" alt="graviti logo" width={160} height={69} className={styles.logo}/>
    </div>
  )
}

export default Navbar