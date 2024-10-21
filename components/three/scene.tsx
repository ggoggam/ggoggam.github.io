"use client"

import * as THREE from 'three'
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { MarchingCubes, MarchingCube, MeshTransmissionMaterial, Environment, Bounds, Text, Point } from '@react-three/drei'
import { Physics, RigidBody, BallCollider } from '@react-three/rapier'
import MetaBall from "./metaball"


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

function createCoordinate(low: number, high: number) {
  return [1,2,3].map((x) => Math.random() * (high - low) + low);
}


export function MetaballScene() {
    return (
        <Canvas camera={{ position: [0, 0, 5], fov: 15 }}>
            <color attach="background" args={['#ffffff']} />
            <Text color={0x0f0f0f} fontSize={.1} fontWeight={900} font={"fonts/GeistMonoVF.woff"} >
            Hello
            </Text>
            <ambientLight intensity={.2} />
            <Physics gravity={[0, 2, 0]}>
            <MarchingCubes resolution={80} maxPolyCount={8000} enableUvs={false} enableColors>
                <MeshTransmissionMaterial 
                vertexColors 
                chromaticAberration={0.5}
                distortion={0.5}
                distortionScale={0.5}
                ></MeshTransmissionMaterial>
                {
                  ["indianred", "skyblue", "teal", "orange", "hotpink", "aquamarine"].map(
                    (color) => <MetaBall color={color} position={createCoordinate(-1, 1)}/>
                  )
                }
                <Pointer />
            </MarchingCubes>
            </Physics>
            <Environment files="assets/scene/industrial.hdr" />
            <Bounds fit clip observe margin={1}>
            <mesh visible={false}>
                <boxGeometry args={[.4, .1, .1]}/>
            </mesh>
            </Bounds>
        </Canvas>
    )
    
}