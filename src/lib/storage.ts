// essas funções são responsáveis por salvar e buscar dados do localStorage, que é uma forma de armazenamento local no navegador. O localStorage só aceita strings, então usamos JSON.stringify para converter os valores para string antes de salvar, e JSON.parse para converter de volta para o tipo original quando buscamos os valores.
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);

    if (!item) return fallback;

    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

// essa parte faz com que o valor seja salvo como string, já que o localStorage só aceita strings. O JSON.stringify converte o valor para string, e o JSON.parse converte de volta para o tipo original quando for buscar o valor.
export function setStorageItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}