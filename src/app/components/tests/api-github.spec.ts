import { TestBed } from '@angular/core/testing';

import { ApiGithub } from './api-github';

describe('ApiGithub', () => {
  let service: ApiGithub;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiGithub);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
