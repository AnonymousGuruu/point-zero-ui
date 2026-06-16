declare module 'next/navigation' {
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    prefetch(url: string): void;
    back(): void;
    forward(): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): any;
}

// Add this right here:
declare module '@/app/three' {
  const content: any;
  export default content;
  export const PerspectiveCamera: any;
  export const Scene: any;
  export const WebGLRenderer: any;
  export const OctahedronGeometry: any;
  export const MeshPhongMaterial: any;
  export const MeshBasicMaterial: any;
  export const Mesh: any;
  export const Group: any;
  export const AmbientLight: any;
  export const PointLight: any;
  export const Clock: any;
}