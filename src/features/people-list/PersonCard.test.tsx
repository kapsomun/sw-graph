/// <reference types="@testing-library/jest-dom" />

import { screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PersonCard from './PersonCard';
import type { Person } from '@/entities/person/types';
import { render } from '@tests/utils/render';

const mockPerson: Person = {
  id: 1, // number
  name: 'Luke Skywalker',
  films: [1, 2, 3], // number[]
  starships: [10], // number[]
  url: '/api/people/1',
};

describe('PersonCard', () => {
  it('renders the character name', () => {
    render(<PersonCard person={mockPerson} />);
    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
  });

  it('renders correct initials', () => {
    render(<PersonCard person={mockPerson} />);
    expect(screen.getByText('LS')).toBeInTheDocument();
  });

  it('shows number of films and starships', () => {
    render(<PersonCard person={mockPerson} />);
    expect(screen.getByText(/Films: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Starships: 1/i)).toBeInTheDocument();
  });

  it('has a link to the character details page', () => {
    render(<PersonCard person={mockPerson} />);
    const link = screen.getByRole('link', { name: /open details for luke skywalker/i });
    expect(link).toHaveAttribute('href', '/people/1');
  });

  it('generates initials for a single-word name', () => {
    const oneName: Person = {
      ...mockPerson,
      id: 2,
      name: 'Chewbacca',
      url: '/api/people/2',
      films: [], // number[]
      starships: [], // number[]
    };
    render(<PersonCard person={oneName} />);
    expect(screen.getByText('C')).toBeInTheDocument();
  });
});
