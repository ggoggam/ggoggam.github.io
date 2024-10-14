'use client'

import * as THREE from 'three'
import { useRef } from 'react'
import { Canvas, extend, useFrame } from '@react-three/fiber'
import { MarchingCubes, MarchingCube, MeshTransmissionMaterial, Environment, Bounds, Text, Effects } from '@react-three/drei'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import { useAppContext } from './context'
import { EffectComposer, Noise } from '@react-three/postprocessing'


function MetaBall({ color, vec = new THREE.Vector3(), ...props }) {
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

function Pointer({ vec = new THREE.Vector3() }) {
  const ref = useRef()
  useFrame(({ pointer, viewport }) => {
    const { width, height } = viewport.getCurrentViewport()
    vec.set(pointer.x * (width / 2), pointer.y * (height / 2), 0)
    ref.current.setNextKinematicTranslation(vec)
  })
  return (
    <RigidBody type="kinematicPosition" colliders={false} ref={ref}>
      <MarchingCube strength={0.5} subtract={10} color="indianred" />
      <BallCollider args={[0.1]} type="dynamic" />
    </RigidBody>
  )
}

export default function Home() {
  const { chosen } = useAppContext();
  
    return (
      <div className="flex-grow" style={{ height: '70vh' }}>
        <Canvas camera={{ position: [0, 0, 10], fov: 15 }}>
          <color attach="background" args={['#ffffff']} />
          <Text color={0x000000} fontSize={.1} font={"fonts/GeistMono.woff"} fontWeight={900}>
            Today,{"\n"}I{"\n"}{chosen}
          </Text>
          <ambientLight intensity={1} />
          <Physics gravity={[0, 2, 0]}>
            <MarchingCubes resolution={90} maxPolyCount={20000} enableUvs={false} enableColors>
              <MeshTransmissionMaterial 
                vertexColors 
                chromaticAberration={0.5}
                distortion={0.5}
                distortionScale={0.5}
              ></MeshTransmissionMaterial>
              {/* <MetaBall color="indianred" position={[1, 1, 0.5]} /> */}
              <MetaBall color="skyblue" position={[-1, -1, -0.5]} />
              <MetaBall color="teal" position={[2, 2, 0.5]} />
              <MetaBall color="orange" position={[-2, -2, -0.5]} />
              <MetaBall color="hotpink" position={[3, 3, 0.5]} />
              <MetaBall color="aquamarine" position={[3, 3, 0.5]} />
              <Pointer></Pointer>
            </MarchingCubes>
          </Physics>
          <Environment files="img/industrial.hdr" />
          {/* Zoom to fit a 1/1/1 box to match the marching cubes */}
          <Bounds fit clip observe margin={1}>
            <mesh visible={false}>
              <boxGeometry />
            </mesh>
          </Bounds>
          <EffectComposer>
            <Noise opacity={0.4} />
          </EffectComposer>
        </Canvas>
      </div>
    );
}
