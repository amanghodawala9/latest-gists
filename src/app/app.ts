import { Component, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';

interface Gist {
  html_url: string;
  id: string;
  created_at: string;
  description: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

@Component({
  selector: 'app-root',
  imports: [DatePipe],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('latest-gists');
  latestGists = signal<Gist[]>([]);

  constructor(private http: HttpClient) {
    this.loadmore();
  }

  showGist(index: number) {
    window.open(this.latestGists()[index].html_url, '_blank');
  }

  loadmore() {
    this.http.get<Gist[]>('https://api.github.com/gists').subscribe({
      next: (value) => {
        const existingIds = new Set(this.latestGists().map((g) => g.id));
        const newGists = value.filter((gist) => !existingIds.has(gist.id));

        if (newGists.length === 0) {
          alert('No new gists found. Please try again later.');
          return;
        }

        this.latestGists.set(
          [...this.latestGists(), ...newGists].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),
        );
      },
      error: (err) => console.log(err),
      complete: () => console.log('loaded more!'),
    });
  }
}
