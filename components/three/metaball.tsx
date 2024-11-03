import * as THREE from 'three'
import { useRef } from 'react'
import { Props, useFrame } from '@react-three/fiber'
import { MarchingCube } from '@react-three/drei'
import {  RigidBody, BallCollider } from '@react-three/rapier'

type MetaballProps = {
  color: THREE.Color;
  vec: THREE.Vector3;
}


export default function MetaBall({ color, vec = new THREE.Vector3(), ...props }: MetaballProps) {
    const api = useRef()
    useFrame((state, delta) => {
      delta = Math.min(delta, 0.1)
  
      api.current.applyImpulse(
        vec
          .copy(api.current.translation())
          .normalize()
          .multiplyScalar(delta * -0.05),
      )
    })
    return (
      <RigidBody ref={api} colliders={false} linearDamping={4} angularDamping={0.95} {...props}>
        <MarchingCube strength={0.35} subtract={6} color={color} />
        <BallCollider args={[0.1]} type="dynamic" />
      </RigidBody>
    )
  }