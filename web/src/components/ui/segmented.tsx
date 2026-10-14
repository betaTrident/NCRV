"use client"
import { Segmented as AntSegmented } from "antd"
export function Segmented({name, value, options, onValueChange}: {name: string; value: string; options: {value: string; label: string}[]; onValueChange: (value: string) => void}) { return <AntSegmented aria-label={name.replaceAll("-", " ")} name={name} value={value} options={options} onChange={onValueChange} /> }
