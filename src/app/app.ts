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
  latestGists = signal<Gist[]>([] as Gist[]);
  constructor(private http: HttpClient) {
    this.http.get<Gist[]>('https://api.github.com/gists').subscribe({
      next: (value) => {
        this.latestGists.set(value);
        this.latestGists.set(
          this.latestGists().sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),
        );
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('complete');
      },
    });
  }

  showGist(index: number) {
    window.open(this.latestGists()[index].html_url, '_blank');
  }

  loadmore() {
    this.http.get<Gist[]>('https://api.github.com/gists').subscribe({
      next: (value) => {
        let newData = false;
        value.forEach((gist) => {
          let alreadyExists = false;
          this.latestGists().forEach((oldGist) => {
            if (oldGist.id === gist.id) {
              alreadyExists = true;
            }
          });
          if (!alreadyExists) {
            newData = true;
            this.latestGists().push(gist);
          }
        });
        this.latestGists.set(
          this.latestGists().sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          ),
        );
        if (!newData) {
          alert("No new gists found. Please try again later.");
        }
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => {
        console.log('loaded more!');
      },
    });
  }
}
