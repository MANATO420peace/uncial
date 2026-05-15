'use client'

import { useRef } from 'react'
import { X, ImagePlus } from 'lucide-react'

interface Props {
  files: File[]
  onChange: (files: File[]) => void
  maxImages?: number
}

export function ImageUpload({ files, onChange, maxImages = 4 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    const merged = [...files, ...selected].slice(0, maxImages)
    onChange(merged)
    e.target.value = ''
  }

  function remove(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {files.map((file, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          </div>
        ))}
        {files.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <ImagePlus className="h-5 w-5" />
            <span className="text-[10px]">追加</span>
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">最大{maxImages}枚まで</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  )
}
