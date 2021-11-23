export interface IMouseInput {
  x: number
  y: number
  lastX: number
  lastY: number
  dragging: boolean
  wheel: number
  lastWheel: number
}

export default class DesktopInput {
  public lockPointer: boolean = false
  public currentlyPressedKeys: Map<string, boolean>
  public mouseInput: IMouseInput
  private raf = 0
  private t = performance.now()

  constructor(public el: HTMLElement, options?: { lockPointer?: boolean }) {
    if (options) {
      if (options.lockPointer !== undefined) {
        this.lockPointer = options.lockPointer
      }
    }

    this.currentlyPressedKeys = new Map()
    this.mouseInput = {
      x: 0,
      y: 0,
      lastX: 0,
      lastY: 0,
      dragging: false,
      wheel: 0,
      lastWheel: 0
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      this.currentlyPressedKeys.set(e.key, true)
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      this.currentlyPressedKeys.set(e.key, false)
    }

    const handleMouseMove = (e: MouseEvent) => {
      this.mouseInput.x = e.screenX
      this.mouseInput.y = e.screenY
    }
    const handleWheel = (e: WheelEvent) => {
      this.mouseInput.wheel += e.deltaY
    }
    const handleDragStart = () => {
      this.mouseInput.dragging = true
    }
    const handleDragEnd = () => {
      this.mouseInput.dragging = false
    }
    const addInputListener = () => {
      el.addEventListener('keydown', handleKeyDown)
      el.addEventListener('keyup', handleKeyUp)
      el.addEventListener('mousemove', handleMouseMove)
      el.addEventListener('mousedown', handleDragStart)
      el.addEventListener('mouseup', handleDragEnd)
      el.addEventListener('wheel', handleWheel)
      const af = () => {
        const now = performance.now()
        if (now - this.t > 100) {
          this.t = now
          this.mouseInput.lastX = this.mouseInput.x
          this.mouseInput.lastY = this.mouseInput.y
          this.mouseInput.lastWheel = this.mouseInput.wheel
        }
        requestAnimationFrame(af)
      }
      this.raf = requestAnimationFrame(af)
    }
    const removeInputListener = () => {
      el.removeEventListener('keydown', handleKeyDown)
      el.removeEventListener('keyup', handleKeyUp)
      el.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mousedown', handleDragStart)
      el.removeEventListener('mouseup', handleDragEnd)
      el.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(this.raf)
    }

    if (this.lockPointer) {
      // @ts-ignore
      el.requestPointerLock = el.requestPointerLock || el.mozRequestPointerLock
      // @ts-ignore
      el.exitPointerLock = el.exitPointerLock || el.mozExitPointerLock
      el.addEventListener('click', el.requestPointerLock)
      const handleLockChange = () => {
        // @ts-ignore
        if (document.pointerLockElement === el || document.mozPointerLockElement === el) {
          addInputListener()
        } else {
          removeInputListener()
        }
      }
      document.addEventListener('pointerlockchange', handleLockChange, false)
      document.addEventListener('mozpointerlockchange', handleLockChange, false)
    } else {
      el.contentEditable = 'true'
      el.style.cursor = 'default'
      el.style.outline = 'none'
      addInputListener()
    }
  }
}
