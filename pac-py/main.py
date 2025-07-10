import tkinter as tk
from tkinter import filedialog, messagebox

class PACEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("PAC Editor")

        self.text = tk.Text(self.root, wrap=tk.WORD)
        self.text.pack(expand=1, fill="both")

        self.open_button = tk.Button(self.root, text="Open PAC File", command=self.open_file)
        self.open_button.pack(side=tk.LEFT, padx=5, pady=5)

        self.save_button = tk.Button(self.root, text="Save PAC File", command=self.save_file)
        self.save_button.pack(side=tk.RIGHT, padx=5, pady=5)

    def open_file(self):
        file_path = filedialog.askopenfilename(filetypes=[("PAC Files", "*.pac"), ("All Files", "*.*")])
        if file_path:
            with open(file_path, 'r') as file:
                content = file.read()
                self.text.delete(1.0, tk.END)
                self.text.insert(tk.END, content)

    def save_file(self):
        file_path = filedialog.asksaveasfilename(defaultextension=".pac", filetypes=[("PAC Files", "*.pac"), ("All Files", "*.*")])
        if file_path:
            with open(file_path, 'w') as file:
                content = self.text.get(1.0, tk.END)
                file.write(content)
            messagebox.showinfo("Info", "File saved successfully!")

if __name__ == "__main__":
    root = tk.Tk()
    editor = PACEditor(root)
    root.mainloop()
