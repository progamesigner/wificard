<script lang="ts">
  import { create } from 'qrcode'

  export let data: string = ''
  export let margin: number = 0

  $: qrcode = create(data, {})
  $: size = qrcode.modules.size + Math.max(0, margin || 0) * 2
  $: path = makeSVGPath(qrcode.modules.data, qrcode.modules.size, Math.max(0, margin || 0))

  function makeSVGPath(data: Uint8Array, size: number, margin: number): string {
    let operations = [] as Array<string>

    let moveBy = 0 // @note: number of masked modules
    let skipBy = 0 // @note: number of non-masked modules
    let startRow = false // @note: should start as new row

    for (let index = 0; index < data.length; ++index) {
      const x = Math.floor(index % size)
      const y = Math.floor(index / size)

      if (x === 0 && !startRow) {
        startRow = true
      }

      if (!!data[index]) {
        moveBy++

        if (startRow) {
          operations.push(`M${x + margin} ${0.5 + y + margin}`)
          startRow = false
        } else {
          operations.push(`m${skipBy} 0`)
        }

        if (x + 1 === size || !data[index + 1]) {
          operations.push(`h${moveBy}`)
          moveBy = 0
        }

        skipBy = 0
      } else {
        skipBy++
      }
    }

    return operations.join('')
  }
</script>

<div class="aspect-square stroke-black stroke-1">
  <svg
    shape-rendering="crispEdges"
    viewBox={`0 0 ${size} ${size}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d={path} />
  </svg>
</div>
