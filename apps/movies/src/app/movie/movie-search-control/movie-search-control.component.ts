import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { of, Subject, switchMap } from 'rxjs';

import { MovieImagePipe } from '../movie-image.pipe';
import { MovieModel } from '../movie-model';
import { SearchMovieService } from '../search-movie.service';

@Component({
  selector: 'app-movie-search-control',
  templateUrl: './movie-search-control.component.html',
  styleUrls: ['./movie-search-control.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MovieSearchControlComponent,
      multi: true,
    },
  ],
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, MovieImagePipe],
})
export class MovieSearchControlComponent
  implements ControlValueAccessor, AfterViewInit
{
  @ViewChild('searchInput')
  searchInput!: ElementRef<HTMLInputElement>;

  readonly searchTerm$ = new Subject<string>();

  movies$ = this.searchTerm$.pipe(
    switchMap(term =>
      term ? this.searchMovieService.searchMovies(term) : of(null)
    )
  );

  onChange = (movie: MovieModel) => {};
  onTouched = () => {};

  private movieCache!: MovieModel;

  constructor(private searchMovieService: SearchMovieService) {}

  ngAfterViewInit(): void {
    if (this.movieCache) {
      this.searchInput.nativeElement.value = this.movieCache.title;
    }
  }

  selectMovie(movie: MovieModel) {
    this.onChange(movie);
    this.searchTerm$.next('');
    this.searchInput.nativeElement.value = movie.title;
  }

  writeValue(movie: MovieModel): void {
    if (!this.searchInput) {
      this.movieCache = movie;
    } else {
      this.searchInput.nativeElement.value = movie ? movie.title : '';
    }
    this.searchTerm$.next('');
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {}
}
